'use server';

import { Role } from 'src/constants/common';
import { resetPasswordTokensTable, usersTable } from 'src/schema';
import { resetPasswordSchema } from 'src/schemas/auth';
import { db } from 'src/utils/db';
import { auth } from 'src/utils/lucia';
import { SafeActionError, action, authAction } from 'src/utils/safe-action';

import dayjs from 'dayjs';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';
import { z } from 'zod';

export const generateResetPasswordToken = authAction(
  z.string().cuid2(),

  async (generateForUserId, ctx) => {
    const { userId } = ctx.session;

    if (ctx.user.role !== Role.Admin) {
      throw new SafeActionError('Forbidden Access');
    }

    const [existingResetPasswordToken] = await db
      .select()
      .from(resetPasswordTokensTable)
      .where(
        and(
          eq(resetPasswordTokensTable.userId, generateForUserId),
          gt(resetPasswordTokensTable.expiresAt, new Date()),
          eq(resetPasswordTokensTable.isValid, true)
        )
      );

    if (existingResetPasswordToken) return existingResetPasswordToken.id;

    const [{ resetPasswordTokenId }] = await db
      .insert(resetPasswordTokensTable)
      .values({
        userId: generateForUserId,
        expiresAt: dayjs().add(2, 'hour').toDate(),
        createdBy: userId,
      })
      .returning({ resetPasswordTokenId: resetPasswordTokensTable.id });

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
      .from(resetPasswordTokensTable)
      .where(
        and(
          eq(resetPasswordTokensTable.id, data.resetPasswordTokenId),
          eq(resetPasswordTokensTable.isValid, true)
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

export const resetPassword = action(resetPasswordSchema, async (data) => {
  const result = await db.transaction(async (tx) => {
    const [resetPasswordToken] = await tx
      .select()
      .from(resetPasswordTokensTable)
      .where(
        and(
          eq(resetPasswordTokensTable.id, data.resetPasswordTokenId),
          gt(resetPasswordTokensTable.expiresAt, new Date()),
          eq(resetPasswordTokensTable.isValid, true)
        )
      );

    if (!resetPasswordToken) {
      throw new SafeActionError('Invalid reset password token');
    }

    const [user] = await tx
      .select({ id: usersTable.id, email: usersTable.email })
      .from(usersTable)
      .where(and(isNull(usersTable.deletedAt), eq(usersTable.id, resetPasswordToken.userId)));

    if (!user) {
      throw new SafeActionError('User may have been deleted or does not exist.');
    }

    const hashedPassword = await new Argon2id().hash(data.password);

    await tx
      .update(resetPasswordTokensTable)
      .set({
        isValid: false,
        updatedBy: resetPasswordToken.userId,
        updatedAt: dayjs().toDate(),
      })
      .where(eq(resetPasswordTokensTable.id, data.resetPasswordTokenId));

    await tx
      .update(usersTable)
      .set({
        isFirstTimeLogin: false,
        hashedPassword,
      })
      .where(eq(usersTable.id, resetPasswordToken.userId));

    return resetPasswordToken;
  });

  await auth.invalidateUserSessions(result.userId);
});
