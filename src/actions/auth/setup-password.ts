'use server';

import { INVALID_PASSWORD_FORMAT, passwordRegex } from 'src/constants/passwords';
import { usersTable } from 'src/schema';
import { db } from 'src/utils/db';
import { auth } from 'src/utils/lucia';
import { authAction } from 'src/utils/safe-action';

import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';
import { z } from 'zod';

export const setupPassword = authAction(
  z
    .object({
      password: z.string().min(8, { message: 'Must contain at least 8 characters' }),
      confirmPassword: z.string().min(8, { message: 'Must contain at least 8 characters' }),
    })
    .refine((value) => value.confirmPassword === value.password, {
      message:
        'The passwords you entered do not match. Please ensure that both passwords are identical before proceeding.',
      path: ['confirmPassword'],
    })
    .refine((value) => passwordRegex.test(value.password), {
      message: INVALID_PASSWORD_FORMAT,
      path: ['password'],
    }),

  async (data, { session }) => {
    const { userId } = session;
    const hashedPassword = await new Argon2id().hash(data.password);

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
