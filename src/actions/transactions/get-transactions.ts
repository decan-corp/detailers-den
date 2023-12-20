'use server';

import { ModeOfPayment, TransactionStatus, VehicleSize } from 'src/constants/common';
import { transactionServices, transactions } from 'src/schema';
import { db } from 'src/utils/db';
import { authAction } from 'src/utils/safe-action';
import { paginationSchema, sortingSchema } from 'src/utils/zod-schema';

import { count, eq, inArray, like, or, desc, asc, isNull, and } from 'drizzle-orm';
import { MySqlSelect } from 'drizzle-orm/mysql-core';
import { castArray } from 'lodash';
import { z } from 'zod';

const withStatusFilter = <T extends MySqlSelect>(
  qb: T,
  status: TransactionStatus | TransactionStatus[]
) => {
  if (Array.isArray(status)) {
    return qb.where(inArray(transactions.status, status));
  }
  return qb.where(eq(transactions.status, status));
};

const withModeOfPaymentFilter = <T extends MySqlSelect>(
  qb: T,
  status: ModeOfPayment | ModeOfPayment[]
) => {
  if (Array.isArray(status)) {
    return qb.where(inArray(transactions.modeOfPayment, status));
  }
  return qb.where(eq(transactions.modeOfPayment, status));
};

const withVehicleSizeFilter = <T extends MySqlSelect>(qb: T, type: VehicleSize | VehicleSize[]) => {
  if (Array.isArray(type)) {
    return qb.where(inArray(transactions.vehicleSize, type));
  }
  return qb.where(eq(transactions.vehicleSize, type));
};

const withSearchFilter = <T extends MySqlSelect>(
  qb: T,
  searchParams: {
    plateNumber?: string;
    customerName?: string;
  }
) =>
  qb.where(
    or(
      searchParams.plateNumber
        ? like(transactions.plateNumber, `%${searchParams.plateNumber}%`)
        : undefined,
      searchParams.customerName
        ? like(transactions.customerName, `%${searchParams.customerName}%`)
        : undefined
    )
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
  plateNumber: z.string().toUpperCase().optional(),
  customerName: z.string().toLowerCase().optional(),
});

export const getTransactions = authAction(
  searchSchema.merge(paginationSchema).merge(sortingSchema),
  (params) => {
    let query = db
      .select({
        id: transactions.id,
        customerName: transactions.customerName,
        plateNumber: transactions.plateNumber,
        status: transactions.status,
        vehicleSize: transactions.vehicleSize,
        totalPrice: transactions.totalPrice,
        modeOfPayment: transactions.modeOfPayment,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
      })
      .from(transactions)
      .$dynamic()
      .where(isNull(transactions.deletedAt));

    if (params.status) {
      query = withStatusFilter(query, params.status);
    }

    if (params.vehicleSize) {
      query = withVehicleSizeFilter(query, params.vehicleSize);
    }

    if (params.modeOfPayment) {
      query = withModeOfPaymentFilter(query, params.modeOfPayment);
    }

    if (params.plateNumber || params.customerName) {
      query = withSearchFilter(query, {
        plateNumber: params.plateNumber,
        customerName: params.customerName,
      });
    }

    query = query.limit(params.pageSize).offset(params.pageIndex);

    if (params.sortBy) {
      const sortBy = castArray(params.sortBy);
      query = query.orderBy(
        ...sortBy.map(({ id, desc: isDesc }) => {
          const field = id as keyof typeof transactions.$inferSelect;
          if (isDesc) {
            return desc(transactions[field]);
          }
          return asc(transactions[field]);
        })
      );
    }

    return query;
  }
);

export const getTransactionsCount = authAction(searchSchema, async (params) => {
  let query = db
    .select({
      value: count(),
    })
    .from(transactions)
    .$dynamic()
    .where(isNull(transactions.deletedAt));

  if (params.status) {
    query = withStatusFilter(query, params.status);
  }

  if (params.vehicleSize) {
    query = withVehicleSizeFilter(query, params.vehicleSize);
  }

  if (params.modeOfPayment) {
    query = withModeOfPaymentFilter(query, params.modeOfPayment);
  }

  if (params.plateNumber || params.customerName) {
    query = withSearchFilter(query, {
      plateNumber: params.plateNumber,
      customerName: params.customerName,
    });
  }

  const [{ value }] = await query;

  return value;
});

export const getTransaction = authAction(z.string().cuid2(), async (id) => {
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), isNull(transactions.deletedAt)))
    .limit(1);

  if (!transaction) {
    return undefined;
  }

  const transactionServicesList = await db
    .select()
    .from(transactionServices)
    .where(eq(transactionServices.transactionId, id))
    .orderBy(asc(transactionServices.createdAt));

  return {
    ...transaction,
    transactionServices: transactionServicesList,
  };
});
