'use server';

import { Role } from 'src/constants/common';
import { resetPasswordTokens, users } from 'src/schema';
import { db } from 'src/utils/db';
import { ProviderId, auth } from 'src/utils/lucia';
import { SafeActionError, action, authAction } from 'src/utils/safe-action';

import cuid2 from '@paralleldrive/cuid2';
import dayjs from 'dayjs';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { z } from 'zod';

export const generateResetPasswordToken = authAction(
  z.string().cuid2(),

  async (generateForUserId, { session }) => {
    const { role, userId } = session.user;

    if (role !== Role.Admin) {
      throw new SafeActionError('Forbidden Access');
    }

    const [existingResetPasswordToken] = await db
      .select()
      .from(resetPasswordTokens)
      .where(
        and(
          eq(resetPasswordTokens.userId, generateForUserId),
          gt(resetPasswordTokens.expiresAt, new Date()),
          eq(resetPasswordTokens.isValid, true)
        )
      );

    if (existingResetPasswordToken) return existingResetPasswordToken.id;

    const resetPasswordTokenId = cuid2.createId();
    await db.insert(resetPasswordTokens).values({
      id: resetPasswordTokenId,
      userId: generateForUserId,
      expiresAt: dayjs().add(2, 'hour').toDate(),
      createdById: userId,
    });

    return resetPasswordTokenId;
  }
);

export const verifyResetPasswordToken = action(
  z.object({
    resetPasswordTokenId: z.string().cuid2(),
  }),
  async (data) => {
    const [record] = await db
      .select()
      .from(resetPasswordTokens)
      .where(
        and(
          eq(resetPasswordTokens.id, data.resetPasswordTokenId),
          eq(resetPasswordTokens.isValid, true)
        )
      );

    if (!record) {
      throw new SafeActionError('Invalid reset password token');
    }

    if (dayjs().isAfter(record.expiresAt)) {
      throw new SafeActionError('The reset password link has expired.');
    }

    return record;
  }
);

export const resetPassword = action(
  z
    .object({
      resetPasswordTokenId: z.string().cuid2(),
      password: z.string().min(6, { message: 'Must contain at least 6 characters' }),
      confirmPassword: z.string().min(6, { message: 'Must contain at least 6 characters' }),
    })
    .refine((value) => value.confirmPassword === value.password, {
      message:
        'The passwords you entered do not match. Please ensure that both passwords are identical before proceeding.',
      path: ['confirmPassword'],
    }),

  async (data) => {
    await db.transaction(async (tx) => {
      const [resetPasswordToken] = await tx
        .select()
        .from(resetPasswordTokens)
        .where(
          and(
            eq(resetPasswordTokens.id, data.resetPasswordTokenId),
            gt(resetPasswordTokens.expiresAt, new Date()),
            eq(resetPasswordTokens.isValid, true)
          )
        );

      if (!resetPasswordToken) {
        throw new SafeActionError('Invalid reset password token');
      }

      const [user] = await tx
        .select({ email: users.email })
        .from(users)
        .where(and(isNull(users.deletedAt), eq(users.id, resetPasswordToken.userId)));

      if (!user) {
        throw new SafeActionError('User may have been deleted or does not exist.');
      }

      await tx
        .update(resetPasswordTokens)
        .set({
          isValid: false,
          updatedById: resetPasswordToken.userId,
        })
        .where(eq(resetPasswordTokens.id, data.resetPasswordTokenId));

      await auth.updateKeyPassword(ProviderId.email, user.email, data.password);
      await auth.invalidateAllUserSessions(resetPasswordToken.userId);
    });
  }
);
