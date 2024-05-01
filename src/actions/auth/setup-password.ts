'use server';

import { usersTable } from 'src/schema';
import { setupPasswordSchema } from 'src/schemas/auth';
import { db } from 'src/utils/db';
import { auth } from 'src/utils/lucia';
import { authAction } from 'src/utils/safe-action';

import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';

export const setupPassword = authAction(setupPasswordSchema, async (data, { session }) => {
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
});
