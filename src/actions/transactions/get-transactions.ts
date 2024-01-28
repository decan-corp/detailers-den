'use server';

import { ModeOfPayment, TransactionStatus, VehicleSize } from 'src/constants/common';
import {
  crewEarningsTable,
  servicesTable,
  transactionServicesTable,
  transactionsTable,
  usersTable,
} from 'src/schema';
import { db } from 'src/utils/db';
import { authAction } from 'src/utils/safe-action';
import { paginationSchema, sortingSchema } from 'src/utils/zod-schema';

import { count, eq, inArray, like, or, desc, asc, isNull, and, between, sql } from 'drizzle-orm';
import { castArray } from 'lodash';
import { z } from 'zod';

const withStatusFilter = (status: TransactionStatus | TransactionStatus[]) => {
  if (Array.isArray(status)) {
    return inArray(transactionsTable.status, status);
  }
  return eq(transactionsTable.status, status);
};

const withModeOfPaymentFilter = (status: ModeOfPayment | ModeOfPayment[]) => {
  if (Array.isArray(status)) {
    return inArray(transactionsTable.modeOfPayment, status);
  }
  return eq(transactionsTable.modeOfPayment, status);
};

const withVehicleSizeFilter = (type: VehicleSize | VehicleSize[]) => {
  if (Array.isArray(type)) {
    return inArray(transactionsTable.vehicleSize, type);
  }
  return eq(transactionsTable.vehicleSize, type);
};

const withSearchFilter = (searchParams: { plateNumber?: string; customerName?: string }) =>
  or(
    searchParams.plateNumber
      ? like(transactionsTable.plateNumber, `%${searchParams.plateNumber}%`)
      : undefined,
    searchParams.customerName
      ? like(transactionsTable.customerName, `%${searchParams.customerName}%`)
      : undefined
  );

const searchSchema = z.object({
  status: z
    .nativeEnum(TransactionStatus)
    .or(z.array(z.nativeEnum(TransactionStatus)))
    .optional(),
  vehicleSize: z
    .nativeEnum(VehicleSize)
    .or(z.array(z.nativeEnum(VehicleSize)))
    .optional(),
  modeOfPayment: z
    .nativeEnum(ModeOfPayment)
    .or(z.array(z.nativeEnum(ModeOfPayment)))
    .optional(),
  services: z.array(z.string().cuid2()).optional(),
  crews: z.array(z.string().cuid2()).optional(),
  plateNumber: z.string().toUpperCase().optional(),
  customerName: z.string().toLowerCase().optional(),
  createdAt: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
});

export const getTransactions = authAction(
  searchSchema.merge(paginationSchema).merge(sortingSchema),
  async (params) => {
    let query = db
      .select({
        id: transactionsTable.id,
        customerName: transactionsTable.customerName,
        plateNumber: transactionsTable.plateNumber,
        status: transactionsTable.status,
        vehicleSize: transactionsTable.vehicleSize,
        totalPrice: transactionsTable.totalPrice,
        modeOfPayment: transactionsTable.modeOfPayment,
        createdAt: transactionsTable.createdAt,
        completedAt: transactionsTable.completedAt,
        updatedAt: transactionsTable.updatedAt,
        note: transactionsTable.note,
        services: sql`GROUP_CONCAT(DISTINCT ${servicesTable.serviceName})`.mapWith({
          mapFromDriverValue(value: unknown) {
            return String(value).split(',');
          },
        }),
        crews: sql`GROUP_CONCAT(DISTINCT ${usersTable.name})`.mapWith({
          mapFromDriverValue(value: unknown) {
            return String(value).split(',');
          },
        }),
      })
      .from(transactionsTable)
      .innerJoin(
        transactionServicesTable,
        eq(transactionServicesTable.transactionId, transactionsTable.id)
      )
      .innerJoin(servicesTable, eq(servicesTable.id, transactionServicesTable.serviceId))
      .innerJoin(
        crewEarningsTable,
        eq(crewEarningsTable.transactionServiceId, transactionServicesTable.id)
      )
      .innerJoin(usersTable, eq(usersTable.id, crewEarningsTable.crewId))
      .groupBy(transactionsTable.id)
      .$dynamic();

    query = query.where(
      and(
        isNull(transactionsTable.deletedAt),
        params.status ? withStatusFilter(params.status) : undefined,
        params.vehicleSize ? withVehicleSizeFilter(params.vehicleSize) : undefined,
        params.modeOfPayment ? withModeOfPaymentFilter(params.modeOfPayment) : undefined,
        params.plateNumber || params.customerName
          ? withSearchFilter({
              plateNumber: params.plateNumber,
              customerName: params.customerName,
            })
          : undefined,
        params.createdAt
          ? between(transactionsTable.createdAt, params.createdAt.from, params.createdAt.to)
          : undefined,
        params.services ? inArray(servicesTable.id, params.services) : undefined,
        params.crews ? inArray(usersTable.id, params.crews) : undefined
      )
    );

    query = query.limit(params.pageSize).offset(params.pageIndex * params.pageSize);

    if (params.sortBy) {
      const sortBy = castArray(params.sortBy);
      query = query.orderBy(
        ...sortBy.map(({ id, desc: isDesc }) => {
          const field = id as keyof typeof transactionsTable.$inferSelect;
          if (isDesc) {
            return desc(transactionsTable[field]);
          }
          return asc(transactionsTable[field]);
        })
      );
    }

    const records = await query;
    return records;
  }
);

export const getTransactionsCount = authAction(searchSchema, async (params) => {
  let query = db
    .select({
      id: transactionsTable.id,
    })
    .from(transactionsTable)
    .innerJoin(
      transactionServicesTable,
      eq(transactionServicesTable.transactionId, transactionsTable.id)
    )
    .innerJoin(servicesTable, eq(servicesTable.id, transactionServicesTable.serviceId))
    .innerJoin(
      crewEarningsTable,
      eq(crewEarningsTable.transactionServiceId, transactionServicesTable.id)
    )
    .innerJoin(usersTable, eq(usersTable.id, crewEarningsTable.crewId))
    .groupBy(transactionsTable.id)
    .$dynamic();

  query = query.where(
    and(
      isNull(transactionsTable.deletedAt),
      params.status ? withStatusFilter(params.status) : undefined,
      params.vehicleSize ? withVehicleSizeFilter(params.vehicleSize) : undefined,
      params.modeOfPayment ? withModeOfPaymentFilter(params.modeOfPayment) : undefined,
      params.plateNumber || params.customerName
        ? withSearchFilter({
            plateNumber: params.plateNumber,
            customerName: params.customerName,
          })
        : undefined,
      params.createdAt
        ? between(transactionsTable.createdAt, params.createdAt.from, params.createdAt.to)
        : undefined,
      params.services ? inArray(servicesTable.id, params.services) : undefined,
      params.crews ? inArray(usersTable.id, params.crews) : undefined
    )
  );

  const [{ value }] = await db.select({ value: count() }).from(query.as('aggregated_transactions'));

  return value;
});

export const getTransaction = authAction(z.string().cuid2(), async (id) => {
  const [transaction] = await db
    .select()
    .from(transactionsTable)
    .where(and(eq(transactionsTable.id, id), isNull(transactionsTable.deletedAt)))
    .limit(1);

  if (!transaction) {
    return undefined;
  }

  const transactionServicesList = await db
    .select()
    .from(transactionServicesTable)
    .where(eq(transactionServicesTable.transactionId, id))
    .orderBy(asc(transactionServicesTable.createdAt));

  return {
    ...transaction,
    transactionServices: transactionServicesList,
  };
});
