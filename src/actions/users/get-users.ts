'use server';

import { Role } from 'src/constants/common';
import { users } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';
import { paginationSchema, sortingSchema } from 'src/utils/zod-schema';

import { count, eq, inArray, like, or, desc, asc, isNull } from 'drizzle-orm';
import { MySqlSelect } from 'drizzle-orm/mysql-core';
import { castArray } from 'lodash';
import { z } from 'zod';

const withRoleFilter = <T extends MySqlSelect>(qb: T, role: Role | Role[]) => {
  if (Array.isArray(role)) {
    return qb.where(inArray(users.role, role));
  }
  return qb.where(eq(users.role, role));
};

const withSearchFilter = <T extends MySqlSelect>(
  qb: T,
  searchParams: {
    name?: string;
    email?: string;
  }
) =>
  qb.where(
    or(
      searchParams.name ? like(users.name, `%${searchParams.name}%`) : undefined,
      searchParams.email ? like(users.email, `%${searchParams.email}%`) : undefined
    )
  );

const searchSchema = z.object({
  role: z
    .nativeEnum(Role)
    .or(z.array(z.nativeEnum(Role)))
    .optional(),
  name: z.string().toLowerCase().optional(),
  email: z.string().toLowerCase().optional(),
});

export const getUsers = authAction(
  searchSchema.merge(paginationSchema).merge(sortingSchema),
  async (params) => {
    let query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        serviceCutPercentage: users.serviceCutPercentage,
        isFirstTimeLogin: users.isFirstTimeLogin,
      })
      .from(users)
      .$dynamic()
      .where(isNull(users.deletedAt));

    if (params.role) {
      query = withRoleFilter(query, params.role);
    }

    if (params.email || params.name) {
      query = withSearchFilter(query, {
        name: params.name,
        email: params.email,
      });
    }

    query = query.limit(params.pageSize).offset(params.pageIndex * params.pageSize);

    if (params.sortBy) {
      const sortBy = castArray(params.sortBy);
      query = query.orderBy(
        ...sortBy.map(({ id, desc: isDesc }) => {
          const field = id as keyof typeof users.$inferSelect;
          if (isDesc) {
            return desc(users[field]);
          }
          return asc(users[field]);
        })
      );
    }

    const records = await query;
    return records;
  }
);

export const getUsersCount = authAction(searchSchema, async (params) => {
  let query = db
    .select({
      value: count(),
    })
    .from(users)
    .$dynamic()
    .where(isNull(users.deletedAt));

  if (params.role) {
    query = withRoleFilter(query, params.role);
  }

  if (params.email || params.name) {
    query = withSearchFilter(query, {
      name: params.name,
      email: params.email,
    });
  }

  const [{ value }] = await query;

  return value;
});

export const getUser = authAction(z.string().cuid2(), async (id, { session }) => {
  const { role, userId } = session.user;

  if (role !== Role.Admin && userId !== id) {
    throw new SafeActionError('Forbidden access');
  }

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return user || undefined;
});
