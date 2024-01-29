'use server';

import { Role } from 'src/constants/common';
import { usersTable } from 'src/schema';
import { createUserSchema } from 'src/schemas/users';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { Scrypt } from 'oslo/password';

export const addUser = authAction(createUserSchema, async (data, ctx) => {
  const { userId } = ctx.session;
  const { role } = ctx.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  const { password, ...userData } = data;

  const hashedPassword = await new Scrypt().hash(password);

  return db.insert(usersTable).values({
    ...userData,
    createdById: userId,
    hashedPassword,
  });
});
