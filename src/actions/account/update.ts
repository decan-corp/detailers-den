'use server';

import { usersTable } from 'src/schema';
import { updateAccountSchema } from 'src/schemas/users';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import dayjs from 'dayjs';
import { and, eq, like, ne } from 'drizzle-orm';

export const updateAccount = authAction(updateAccountSchema, async (params, ctx) => {
  const { userId } = ctx.session;

  const [existingEmail] = await db
    .select()
    .from(usersTable)
    .where(and(ne(usersTable.id, userId), like(usersTable.email, `%${params.email}%`)));

  if (existingEmail) {
    throw new SafeActionError('Email is already taken.');
  }

  await db
    .update(usersTable)
    .set({
      ...params,
      updatedBy: userId,
      updatedAt: dayjs().toDate(),
    })
    .where(eq(usersTable.id, userId));
});
