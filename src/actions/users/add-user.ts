'use server';

import { Role } from 'src/constants/common';
import { usersTable } from 'src/schema';
import { createUserSchema } from 'src/schemas/users';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { like } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';

export const addUser = authAction(createUserSchema, async (data, ctx) => {
  const { userId } = ctx.session;
  const { role } = ctx.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  const [existingEmail] = await db
    .select()
    .from(usersTable)
    .where(like(usersTable.email, `%${data.email}%`));

  if (existingEmail) {
    throw new SafeActionError('Email is already taken.');
  }

  const { password, ...userData } = data;

  const hashedPassword = await new Argon2id().hash(password);

  await db.insert(usersTable).values({
    ...userData,
    createdBy: userId,
    hashedPassword,
  });
});
