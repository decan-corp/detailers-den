'use server';

import { Role } from 'src/constants/common';
import { userKeys, users } from 'src/schema';
import { db } from 'src/utils/db';
import { ProviderId } from 'src/utils/lucia';
import { SafeActionError, authAction } from 'src/utils/safe-action';
import { paginationSchema, sortingSchema } from 'src/utils/zod-schema';

import cuid2 from '@paralleldrive/cuid2';
import { count, eq, inArray, like, or, desc, asc, sql, isNull } from 'drizzle-orm';
import { MySqlSelect } from 'drizzle-orm/mysql-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { castArray } from 'lodash';
import { createKeyId } from 'lucia';
import { generateLuciaPasswordHash } from 'lucia/utils';
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
  (params, { session }) => {
    const { role } = session.user;

    if (role !== Role.Admin) {
      throw new SafeActionError('Forbidden access');
    }

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

    query = query.limit(params.pageSize).offset(params.pageIndex);

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

    return query;
  }
);

export const getUsersCount = authAction(searchSchema, async (params, { session }) => {
  const { role } = session.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

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

export const addUser = authAction(
  createInsertSchema(users, {
    email: (schema) => schema.email.toLowerCase(),
    serviceCutPercentage: z.coerce
      .number()
      .int({ message: 'Must not contain decimal values' })
      .min(0)
      .max(100)
      .nullish(),
  })
    .omit({
      createdById: true,
      updatedById: true,
      deletedById: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      id: true,
    })
    .merge(
      z.object({
        password: z.string().min(6, { message: 'Must contain at least 6 characters' }),
        confirmPassword: z.string().min(6, { message: 'Must contain at least 6 characters' }),
      })
    )
    .refine(
      (value) => {
        if ([Role.StayInCrew, Role.Crew, Role.Detailer].includes(value.role)) {
          return Boolean(value.serviceCutPercentage);
        }

        return true;
      },
      {
        message: 'Service cut percentage is required for crew, detailer, and stay-in-crew roles.',
        path: ['serviceCutPercentage'],
      }
    )
    .refine((value) => value.confirmPassword === value.password, {
      message:
        'The passwords you entered do not match. Please ensure that both passwords are identical before proceeding.',
      path: ['confirmPassword'],
    }),

  (data, { session }) => {
    const { role, userId } = session.user;

    if (role !== Role.Admin) {
      throw new SafeActionError('Forbidden access');
    }

    const { password, ...userData } = data;
    return db.transaction(async (tx) => {
      const id = cuid2.createId();
      await tx.insert(users).values({
        ...userData,
        id,
        createdById: userId,
      });

      const hashedPassword = await generateLuciaPasswordHash(password);

      await tx.insert(userKeys).values({
        id: createKeyId(ProviderId.email, userData.email),
        userId: id,
        hashedPassword,
      });
    });
  }
);

export const updateUser = authAction(
  createSelectSchema(users, {
    image: (schema) => schema.image.optional(),
    serviceCutPercentage: z.coerce
      .number()
      .int({ message: 'Must not contain decimal values' })
      .min(0)
      .max(100)
      .nullish(),
  })
    .omit({
      createdById: true,
      updatedById: true,
      deletedById: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    })
    .refine(
      (value) => {
        if ([Role.StayInCrew, Role.Crew, Role.Detailer].includes(value.role)) {
          return Boolean(value.serviceCutPercentage);
        }

        return true;
      },
      {
        message: 'Service cut percentage is required for crew, detailer, and stay-in-crew roles.',
        path: ['serviceCutPercentage'],
      }
    ),
  async (params, { session }) => {
    const { id, ...userData } = params;
    const { role, userId } = session.user;
    if (role !== Role.Admin && userId !== params.id) {
      throw new SafeActionError('Forbidden access');
    }

    await db
      .update(users)
      .set({ ...userData, updatedById: userId })
      .where(eq(users.id, id));
  }
);

export const softDeleteUser = authAction(z.string().cuid2(), async (id, { session }) => {
  const { role, userId } = session.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  await db
    .update(users)
    .set({
      deletedById: userId,
      deletedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(users.id, id));
});

export const recoverUser = authAction(z.string().cuid2(), async (id, { session }) => {
  const { role } = session.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  await db
    .update(users)
    .set({
      deletedById: null,
      deletedAt: null,
    })
    .where(eq(users.id, id));
});
