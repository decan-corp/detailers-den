'use server';

import { Role } from 'src/constants/common';
import { usersTable } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';
import { paginationSchema, sortingSchema } from 'src/utils/zod-schema';

import { count, eq, inArray, like, or, desc, asc, isNull, and } from 'drizzle-orm';
import { castArray } from 'lodash';
import { z } from 'zod';

const withRoleFilter = (role: Role | Role[]) => {
  if (Array.isArray(role)) {
    return inArray(usersTable.role, role);
  }
  return eq(usersTable.role, role);
};

const withSearchFilter = (searchParams: { name?: string; email?: string }) =>
  or(
    searchParams.name ? like(usersTable.name, `%${searchParams.name}%`) : undefined,
    searchParams.email ? like(usersTable.email, `%${searchParams.email}%`) : undefined
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
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
        serviceCutPercentage: usersTable.serviceCutPercentage,
      })
      .from(usersTable)
      .$dynamic();

    query = query.where(
      and(
        isNull(usersTable.deletedAt),
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
          const field = id as keyof typeof usersTable.$inferSelect;
          if (isDesc) {
            return desc(usersTable[field]);
          }
          return asc(usersTable[field]);
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
    .from(usersTable)
    .$dynamic();

  query = query.where(
    and(
      isNull(usersTable.deletedAt),
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

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));

  return user || undefined;
});

export const getUserBySession = authAction(z.object({}), async (_, { session }) => {
  const { userId } = session.user;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  return user || undefined;
});

export const getUserOptions = authAction(
  searchSchema.pick({ role: true }).merge(paginationSchema).merge(sortingSchema),
  async (params) => {
    let query = db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        role: usersTable.role,
      })
      .from(usersTable)
      .$dynamic();

    query = query.where(
      and(isNull(usersTable.deletedAt), params.role ? withRoleFilter(params.role) : undefined)
    );

    query = query.limit(params.pageSize).offset(params.pageIndex * params.pageSize);

    if (params.sortBy) {
      const sortBy = castArray(params.sortBy);
      query = query.orderBy(
        ...sortBy.map(({ id, desc: isDesc }) => {
          const field = id as keyof typeof usersTable.$inferSelect;
          if (isDesc) {
            return desc(usersTable[field]);
          }
          return asc(usersTable[field]);
        })
      );
    }

    const records = await query;
    return records;
  }
);
