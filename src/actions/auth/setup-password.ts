'use server';

import { users } from 'src/schema';
import { db } from 'src/utils/db';
import { ProviderId, auth } from 'src/utils/lucia';
import { authAction } from 'src/utils/safe-action';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const setupPassword = authAction(
  z
    .object({
      password: z.string().min(6, { message: 'Must contain at least 6 characters' }),
      confirmPassword: z.string().min(6, { message: 'Must contain at least 6 characters' }),
    })
    .refine((value) => value.confirmPassword === value.password, {
      message:
        'The passwords you entered do not match. Please ensure that both passwords are identical before proceeding.',
      path: ['confirmPassword'],
    }),

  async (data, { session }) => {
    const { email, userId } = session.user;

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          isFirstTimeLogin: false,
        })
        .where(eq(users.id, userId));
      await auth.updateKeyPassword(ProviderId.email, email, data.password);
      await auth.invalidateAllUserSessions(userId);
    });
  }
);
