'use server';

import { Role, TransactionStatus } from 'src/constants/common';
import { transactionsTable } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import dayjs from 'dayjs';
import { and, between, count, desc, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';

export const getVehicleSizeCount = authAction(
  z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
  async ({ startDate, endDate }, { user }) => {
    if (![Role.Admin, Role.Cashier].includes(user.role)) {
      throw new SafeActionError('Forbidden Access');
    }

    const records = await db
      .select({
        vehicleSize: transactionsTable.vehicleSize,
        vehicleSizeCount: count(),
      })
      .from(transactionsTable)
      .where(
        and(
          between(transactionsTable.createdAt, dayjs(startDate).toDate(), dayjs(endDate).toDate()),
          eq(transactionsTable.status, TransactionStatus.Paid),
          isNull(transactionsTable.deletedAt)
        )
      )
      .groupBy(({ vehicleSize }) => [vehicleSize])
      .orderBy(({ vehicleSizeCount }) => desc(vehicleSizeCount));

    return records;
  }
);
