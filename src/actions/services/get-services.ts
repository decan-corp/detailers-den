'use server';

import { services } from 'src/schema';
import { db } from 'src/utils/db';
import { authAction } from 'src/utils/safe-action';
import { paginationSchema, sortingSchema } from 'src/utils/zod-schema';

import { count, eq, like, desc, asc, isNull } from 'drizzle-orm';
import { MySqlSelect } from 'drizzle-orm/mysql-core';
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
  (params) => {
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

export const getServicesCount = authAction(searchSchema, async (params) => {
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

export const getService = authAction(z.string().cuid2(), async (id) => {
  const [service] = await db.select().from(services).where(eq(services.id, id)).limit(1);

  return service || undefined;
});
