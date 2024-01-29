'use server';

import { usersTable } from 'src/schema';
import { db } from 'src/utils/db';
import { auth } from 'src/utils/lucia';
import { authAction } from 'src/utils/safe-action';

import { eq } from 'drizzle-orm';
import { Scrypt } from 'oslo/password';
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
    const { userId } = session;
    const hashedPassword = await new Scrypt().hash(data.password);

    await db
      .update(usersTable)
      .set({
        isFirstTimeLogin: false,
        hashedPassword,
      })
      .where(eq(usersTable.id, userId));

    await auth.invalidateUserSessions(userId);
  }
);
