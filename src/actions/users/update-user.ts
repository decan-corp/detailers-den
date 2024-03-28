'use server';

import { Role } from 'src/constants/common';
import { usersTable } from 'src/schema';
import { updateUserSchema } from 'src/schemas/users';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';

export const updateUser = authAction(updateUserSchema, (params, ctx) => {
  const { userId } = ctx.session;
  const { role } = ctx.user;

  if (role !== Role.Admin && userId !== params.id) {
    throw new SafeActionError('Forbidden access');
  }

  const { id, ...userData } = params;

  return db.transaction(async (tx) => {
    await tx
      .update(usersTable)
      .set({
        ...userData,
        updatedBy: userId,
        updatedAt: dayjs().toDate(),
      })
      .where(eq(usersTable.id, id));
  });
});
