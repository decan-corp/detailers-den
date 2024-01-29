'use server';

import { usersTable } from 'src/schema';
import { db } from 'src/utils/db';
import { auth } from 'src/utils/lucia';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { eq } from 'drizzle-orm';
import { Scrypt } from 'oslo/password';
import { z } from 'zod';

export const changePassword = authAction(
  z
    .object({
      currentPassword: z.string().min(6, { message: 'Must contain at least 6 characters' }),
      newPassword: z.string().min(6, { message: 'Must contain at least 6 characters' }),
      confirmPassword: z.string().min(6, { message: 'Must contain at least 6 characters' }),
    })
    .refine((value) => value.confirmPassword === value.newPassword, {
      message:
        'The passwords you entered do not match. Please ensure that both passwords are identical before proceeding.',
      path: ['confirmPassword'],
    })
    .refine((value) => value.currentPassword !== value.newPassword, {
      message: 'New password must be different from the current password.',
      path: ['newPassword'],
    }),

  async (data, ctx) => {
    const { userId } = ctx.session;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

    if (!user) {
      throw new SafeActionError("User doesn't exist");
    }

    // TODO: remove default empty string once hashedPassword is set to notNull in drizzle-orm
    const isCurrentPasswordValid = await new Scrypt().verify(
      user.hashedPassword || '',
      data.currentPassword
    );

    if (!isCurrentPasswordValid) {
      throw new SafeActionError('Incorrect current password');
    }

    const hashedPassword = await new Scrypt().hash(data.newPassword);
    await db.update(usersTable).set({ hashedPassword }).where(eq(usersTable.id, userId));

    await auth.invalidateUserSessions(userId);
  }
);
