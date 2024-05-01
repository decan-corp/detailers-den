'use server';

import { usersTable } from 'src/schema';
import { changePasswordSchema } from 'src/schemas/auth';
import { db } from 'src/utils/db';
import { auth } from 'src/utils/lucia';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';

export const changePassword = authAction(changePasswordSchema, async (data, ctx) => {
  const { userId } = ctx.session;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  if (!user) {
    throw new SafeActionError("User doesn't exist");
  }

  const isCurrentPasswordValid = await new Argon2id().verify(
    user.hashedPassword,
    data.currentPassword
  );

  if (!isCurrentPasswordValid) {
    throw new SafeActionError('Incorrect current password');
  }

  const hashedPassword = await new Argon2id().hash(data.newPassword);
  await db.update(usersTable).set({ hashedPassword }).where(eq(usersTable.id, userId));

  await auth.invalidateUserSessions(userId);
});
