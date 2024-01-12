'use server';

import { Role } from 'src/constants/common';
import { users } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';
import { paginationSchema, sortingSchema } from 'src/utils/zod-schema';

import { count, eq, inArray, like, or, desc, asc, isNull, and } from 'drizzle-orm';
import { castArray } from 'lodash';
import { z } from 'zod';

const withRoleFilter = (role: Role | Role[]) => {
  if (Array.isArray(role)) {
    return inArray(users.role, role);
  }
  return eq(users.role, role);
};

const withSearchFilter = (searchParams: { name?: string; email?: string }) =>
  or(
    searchParams.name ? like(users.name, `%${searchParams.name}%`) : undefined,
    searchParams.email ? like(users.email, `%${searchParams.email}%`) : undefined
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
      })
      .from(users)
      .$dynamic();

    query = query.where(
      and(
        isNull(users.deletedAt),
        params.role ? withRoleFilter(params.role) : undefined,
        params.email || params.name
          ? withSearchFilter({
              name: params.name,
              email: params.email,
            })
          : undefined
      )
    );

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
    .$dynamic();

  query = query.where(
    and(
      isNull(users.deletedAt),
      params.role ? withRoleFilter(params.role) : undefined,
      params.email || params.name
        ? withSearchFilter({
            name: params.name,
            email: params.email,
          })
        : undefined
    )
  );

  const [{ value }] = await query;

  return value;
});

export const getUser = authAction(z.string().cuid2(), async (id, { session }) => {
  const { role, userId } = session.user;

  if (role !== Role.Admin && userId !== id) {
    throw new SafeActionError('Forbidden access');
  }

  const [user] = await db.select().from(users).where(eq(users.id, id));

  return user || undefined;
});

export const getUserBySession = authAction(z.object({}), async (_, { session }) => {
  const { userId } = session.user;

  const [user] = await db.select().from(users).where(eq(users.id, userId));

  return user || undefined;
});
