'use server';

import { ModeOfPayment, TransactionStatus, VehicleSize } from 'src/constants/common';
import { transactionServices, transactions } from 'src/schema';
import { db } from 'src/utils/db';
import { authAction } from 'src/utils/safe-action';
import { paginationSchema, sortingSchema } from 'src/utils/zod-schema';

import { count, eq, inArray, like, or, desc, asc, isNull, and, between } from 'drizzle-orm';
import { castArray } from 'lodash';
import { z } from 'zod';

const withStatusFilter = (status: TransactionStatus | TransactionStatus[]) => {
  if (Array.isArray(status)) {
    return inArray(transactions.status, status);
  }
  return eq(transactions.status, status);
};

const withModeOfPaymentFilter = (status: ModeOfPayment | ModeOfPayment[]) => {
  if (Array.isArray(status)) {
    return inArray(transactions.modeOfPayment, status);
  }
  return eq(transactions.modeOfPayment, status);
};

const withVehicleSizeFilter = (type: VehicleSize | VehicleSize[]) => {
  if (Array.isArray(type)) {
    return inArray(transactions.vehicleSize, type);
  }
  return eq(transactions.vehicleSize, type);
};

const withSearchFilter = (searchParams: { plateNumber?: string; customerName?: string }) =>
  or(
    searchParams.plateNumber
      ? like(transactions.plateNumber, `%${searchParams.plateNumber}%`)
      : undefined,
    searchParams.customerName
      ? like(transactions.customerName, `%${searchParams.customerName}%`)
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
  plateNumber: z.string().toUpperCase().optional(),
  customerName: z.string().toLowerCase().optional(),
  createdAt: z
    .object({
      startDate: z.date(),
      endDate: z.date(),
    })
    .optional(),
});

export const getTransactions = authAction(
  searchSchema.merge(paginationSchema).merge(sortingSchema),
  async (params) => {
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
        note: transactions.note,
      })
      .from(transactions)
      .$dynamic();

    query = query.where(
      and(
        isNull(transactions.deletedAt),
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
          ? between(transactions.createdAt, params.createdAt.startDate, params.createdAt.endDate)
          : undefined
      )
    );

    query = query.limit(params.pageSize).offset(params.pageIndex * params.pageSize);

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

    const records = await query;
    return records;
  }
);

export const getTransactionsCount = authAction(searchSchema, async (params) => {
  let query = db
    .select({
      value: count(),
    })
    .from(transactions)
    .$dynamic();

  query = query.where(
    and(
      isNull(transactions.deletedAt),
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
        ? between(transactions.createdAt, params.createdAt.startDate, params.createdAt.endDate)
        : undefined
    )
  );

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
