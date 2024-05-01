'use server';

import { usersTable } from 'src/schema';
import { updateAccountSchema } from 'src/schemas/users';
import { db } from 'src/utils/db';
import { authAction } from 'src/utils/safe-action';

import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';

export const updateAccount = authAction(updateAccountSchema, (params, ctx) => {
  const { userId } = ctx.session;

  return db.transaction(async (tx) => {
    await tx
      .update(usersTable)
      .set({
        ...params,
        updatedBy: userId,
        updatedAt: dayjs().toDate(),
      })
      .where(eq(usersTable.id, userId));
  });
});
