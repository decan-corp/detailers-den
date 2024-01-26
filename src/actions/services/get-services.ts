'use server';

import { services } from 'src/schema';
import { db } from 'src/utils/db';
import { authAction } from 'src/utils/safe-action';
import { paginationSchema, sortingSchema } from 'src/utils/zod-schema';

import { count, eq, like, desc, asc, isNull, and } from 'drizzle-orm';
import { castArray } from 'lodash';
import { z } from 'zod';

const searchSchema = z.object({
  serviceName: z.string().toLowerCase().optional(),
  description: z.string().toLowerCase().optional(),
});

export const getServices = authAction(
  searchSchema.merge(paginationSchema).merge(sortingSchema),
  async (params) => {
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
      .$dynamic();

    query = query.where(
      and(
        isNull(services.deletedAt),
        params.serviceName ? like(services.serviceName, `%${params.serviceName}%`) : undefined
      )
    );

    query = query.limit(params.pageSize).offset(params.pageIndex * params.pageSize);

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

    const records = await query;
    return records;
  }
);

export const getServicesCount = authAction(searchSchema, async (params) => {
  let query = db
    .select({
      value: count(),
    })
    .from(services)
    .$dynamic();

  query = query.where(
    and(
      isNull(services.deletedAt),
      params.serviceName ? like(services.serviceName, `%${params.serviceName}%`) : undefined
    )
  );

  const [{ value }] = await query;

  return value;
});

export const getService = authAction(z.string().cuid2(), async (id) => {
  const [service] = await db.select().from(services).where(eq(services.id, id)).limit(1);

  return service || undefined;
});

export const getServiceOptions = authAction(
  sortingSchema.merge(paginationSchema),
  async (params) => {
    let query = db
      .select({
        id: services.id,
        serviceName: services.serviceName,
        priceMatrix: services.priceMatrix,
        description: services.description,
      })
      .from(services)
      .$dynamic();

    query = query.where(isNull(services.deletedAt));

    query = query.limit(params.pageSize).offset(params.pageIndex * params.pageSize);

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

    const records = await query;
    return records;
  }
);
