'use server';

import { Role } from 'src/constants/common';
import { servicesTable } from 'src/schema';
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
  async (params, { user }) => {
    const { role } = user;
    let query = db
      .select({
        id: servicesTable.id,
        serviceName: servicesTable.serviceName,
        description: servicesTable.description,
        createdAt: servicesTable.createdAt,
        updatedAt: servicesTable.updatedAt,
        priceMatrix: servicesTable.priceMatrix,
        ...(role === Role.Admin && { serviceCutPercentage: servicesTable.serviceCutPercentage }),
      })
      .from(servicesTable)
      .$dynamic();

    query = query.where(
      and(
        isNull(servicesTable.deletedAt),
        params.serviceName ? like(servicesTable.serviceName, `%${params.serviceName}%`) : undefined
      )
    );

    query = query.limit(params.pageSize).offset(params.pageIndex * params.pageSize);

    if (params.sortBy) {
      const sortBy = castArray(params.sortBy);
      query = query.orderBy(
        ...sortBy.map(({ id, desc: isDesc }) => {
          const field = id as keyof typeof servicesTable.$inferSelect;
          if (isDesc) {
            return desc(servicesTable[field]);
          }
          return asc(servicesTable[field]);
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
    .from(servicesTable)
    .$dynamic();

  query = query.where(
    and(
      isNull(servicesTable.deletedAt),
      params.serviceName ? like(servicesTable.serviceName, `%${params.serviceName}%`) : undefined
    )
  );

  const [{ value }] = await query;

  return value;
});

export const getService = authAction(z.string().cuid2(), async (id) => {
  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, id)).limit(1);

  return service || undefined;
});

export const getServiceOptions = authAction(
  sortingSchema.merge(paginationSchema),
  async (params) => {
    let query = db
      .select({
        id: servicesTable.id,
        serviceName: servicesTable.serviceName,
        priceMatrix: servicesTable.priceMatrix,
        description: servicesTable.description,
      })
      .from(servicesTable)
      .$dynamic();

    query = query.where(isNull(servicesTable.deletedAt));

    query = query.limit(params.pageSize).offset(params.pageIndex * params.pageSize);

    if (params.sortBy) {
      const sortBy = castArray(params.sortBy);
      query = query.orderBy(
        ...sortBy.map(({ id, desc: isDesc }) => {
          const field = id as keyof typeof servicesTable.$inferSelect;
          if (isDesc) {
            return desc(servicesTable[field]);
          }
          return asc(servicesTable[field]);
        })
      );
    }

    const records = await query;
    return records;
  }
);
