'use server';

import { Role } from 'src/constants/common';
import { usersTable } from 'src/schema';
import { updateUserSchema } from 'src/schemas/users';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import dayjs from 'dayjs';
import { and, eq, like, ne } from 'drizzle-orm';

export const updateUser = authAction(updateUserSchema, async (params, ctx) => {
  const { userId } = ctx.session;
  const { role } = ctx.user;

  if (role !== Role.Admin && userId !== params.id) {
    throw new SafeActionError('Forbidden access');
  }

  const [existingEmail] = await db
    .select()
    .from(usersTable)
    .where(and(ne(usersTable.id, params.id), like(usersTable.email, `%${params.email}%`)));

  if (existingEmail) {
    throw new SafeActionError('Email is already taken.');
  }

  const { id, ...userData } = params;

  await db
    .update(usersTable)
    .set({
      ...userData,
      updatedBy: userId,
      updatedAt: dayjs().toDate(),
    })
    .where(eq(usersTable.id, id));
});
