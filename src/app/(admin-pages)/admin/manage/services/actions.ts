'use server';

import { Role } from 'src/constants/roles';
import { services } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';
import { paginationSchema, sortingSchema } from 'src/utils/zod-schema';

import cuid2 from '@paralleldrive/cuid2';
import { count, eq, like, desc, asc, sql, isNull } from 'drizzle-orm';
import { MySqlSelect } from 'drizzle-orm/mysql-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { castArray } from 'lodash';
import { z } from 'zod';

const withSearchFilter = <T extends MySqlSelect>(
  qb: T,
  searchParams: {
    serviceName?: string;
  }
) =>
  qb.where(
    searchParams.serviceName
      ? like(services.serviceName, `%${searchParams.serviceName}%`)
      : undefined
  );

const searchSchema = z.object({
  serviceName: z.string().toLowerCase().optional(),
  description: z.string().toLowerCase().optional(),
});

export const getServices = authAction(
  searchSchema.merge(paginationSchema).merge(sortingSchema),
  (params, { session }) => {
    const { role } = session.user;

    if (role !== Role.Admin) {
      throw new SafeActionError('Forbidden access');
    }

    let query = db
      .select({
        id: services.id,
        serviceName: services.serviceName,
        price: services.price,
        description: services.description,
        createdAt: services.createdAt,
        updatedAt: services.updatedAt,
      })
      .from(services)
      .$dynamic()
      .where(isNull(services.deletedAt));

    if (params.serviceName) {
      query = withSearchFilter(query, {
        serviceName: params.serviceName,
      });
    }

    query = query.limit(params.pageSize).offset(params.pageIndex);

    if (params.sortBy) {
      const sortBy = castArray(params.sortBy);
      query = query.orderBy(
        ...sortBy.map(({ id, desc: isDesc }) => {
          const field = id as keyof typeof services.$inferSelect;
          if (isDesc) {
            return desc(services[field]);
          }
          return asc(services[field]);
        })
      );
    }

    return query;
  }
);

export const getServicesCount = authAction(searchSchema, async (params, { session }) => {
  const { role } = session.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  let query = db
    .select({
      value: count(),
    })
    .from(services)
    .$dynamic()
    .where(isNull(services.deletedAt));

  if (params.serviceName) {
    query = withSearchFilter(query, {
      serviceName: params.serviceName,
    });
  }

  const [{ value }] = await query;

  return value;
});

export const getService = authAction(z.string().cuid2(), async (id, { session }) => {
  const { role } = session.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  const [service] = await db.select().from(services).where(eq(services.id, id)).limit(1);

  return service || undefined;
});

export const addService = authAction(
  createInsertSchema(services, {
    price: z.coerce
      .number()
      .int()
      .min(1)
      .transform((value) => String(value)),
  }).omit({
    createdById: true,
    updatedById: true,
    deletedById: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    id: true,
  }),

  async (data, { session }) => {
    const { role, userId } = session.user;

    if (role !== Role.Admin) {
      throw new SafeActionError('Forbidden access');
    }

    const id = cuid2.createId();
    await db.insert(services).values({
      ...data,
      id,
      createdById: userId,
    });
  }
);

export const updateService = authAction(
  createSelectSchema(services, {
    price: z.coerce
      .number()
      .int()
      .min(1)
      .transform((value) => String(value)),
  }).omit({
    createdById: true,
    updatedById: true,
    deletedById: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  }),
  async (params, { session }) => {
    const { id, ...serviceData } = params;
    const { role, userId } = session.user;

    if (role !== Role.Admin) {
      throw new SafeActionError('Forbidden access');
    }

    await db
      .update(services)
      .set({ ...serviceData, updatedById: userId })
      .where(eq(services.id, id));
  }
);

export const softDeleteService = authAction(z.string().cuid2(), async (id, { session }) => {
  const { role, userId } = session.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  await db
    .update(services)
    .set({
      deletedById: userId,
      deletedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(services.id, id));
});

export const recoverService = authAction(z.string().cuid2(), async (id, { session }) => {
  const { role } = session.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  await db
    .update(services)
    .set({
      deletedById: null,
      deletedAt: null,
    })
    .where(eq(services.id, id));
});
