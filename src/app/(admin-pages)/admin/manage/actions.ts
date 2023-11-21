'use server';

import { users } from 'src/schema';
import { db } from 'src/utils/db';
import { authAction } from 'src/utils/safe-action';

import { sql } from 'drizzle-orm';
import { z } from 'zod';

export const getUsers = authAction(z.object({}), (_, { session }) => {
  const { role } = session.user;

  if (role !== 'admin') {
    throw new Error('Forbidden access');
  }

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users);
});

export const getUsersCount = authAction(z.object({}), async (_, { session }) => {
  const { role } = session.user;

  if (role !== 'admin') {
    throw new Error('Forbidden access');
  }

  const [{ count }] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(users);

  return count;
});
