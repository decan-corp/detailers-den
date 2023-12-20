'use server';

import { Role, VehicleSize } from 'src/constants/common';
import { services } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';
import { paginationSchema, sortingSchema } from 'src/utils/zod-schema';

import { count, eq, like, desc, asc, sql, isNull } from 'drizzle-orm';
import { MySqlSelect } from 'drizzle-orm/mysql-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { castArray, uniqBy } from 'lodash';
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
        serviceCutPercentage: services.serviceCutPercentage,
        description: services.description,
        createdAt: services.createdAt,
        updatedAt: services.updatedAt,
        priceMatrix: services.priceMatrix,
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

const priceMatrixSchema = z
  .array(
    z.object({
      price: z.number().int().min(1),
      vehicleSize: z.nativeEnum(VehicleSize),
    })
  )
  .refine(
    (value) => {
      const uniquePriceMatrix = uniqBy(value, 'vehicleSize');
      return uniquePriceMatrix.length === value.length;
    },
    {
      message: 'Vehicle Sizes must be unique',
      path: ['priceMatrix'],
    }
  );

export const addService = authAction(
  createInsertSchema(services, {
    priceMatrix: priceMatrixSchema,
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

    await db.insert(services).values({
      ...data,
      createdById: userId,
    });
  }
);

export const updateService = authAction(
  createSelectSchema(services, {
    priceMatrix: priceMatrixSchema,
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
