'use server';

import { Role } from 'src/constants/roles';
import { users } from 'src/schema';
import { db } from 'src/utils/db';
import { authAction } from 'src/utils/safe-action';

import { count, eq, inArray } from 'drizzle-orm';
import { MySqlSelect } from 'drizzle-orm/mysql-core';
import { z } from 'zod';

const withRoleFilter = <T extends MySqlSelect>(qb: T, role: Role | Role[]) => {
  if (Array.isArray(role)) {
    return qb.where(inArray(users.role, role));
  }
  return qb.where(eq(users.role, role));
};

export const getUsers = authAction(
  z.object({
    role: z
      .nativeEnum(Role)
      .or(z.array(z.nativeEnum(Role)))
      .optional(),
  }),
  (params, { session }) => {
    const { role } = session.user;

    if (role !== Role.Admin) {
      throw new Error('Forbidden access');
    }

    let query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .$dynamic();

    if (params.role) {
      query = withRoleFilter(query, params.role);
    }

    return query;
  }
);

export const getUsersCount = authAction(
  z.object({
    role: z
      .nativeEnum(Role)
      .or(z.array(z.nativeEnum(Role)))
      .optional(),
  }),
  async (params, { session }) => {
    const { role } = session.user;

    if (role !== Role.Admin) {
      throw new Error('Forbidden access');
    }

    let query = db
      .select({
        value: count(),
      })
      .from(users)
      .$dynamic();

    if (params.role) {
      query = withRoleFilter(query, params.role);
    }

    const [{ value }] = await query;

    return value;
  }
);
