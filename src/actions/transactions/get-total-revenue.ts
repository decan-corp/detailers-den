'use server';

import { Role, TransactionStatus } from 'src/constants/common';
import { transactionsTable } from 'src/schema';
import { db } from 'src/utils/db';
import { getIncreaseInPercentage } from 'src/utils/formula';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import dayjs from 'dayjs';
import { and, between, eq, isNull, sum } from 'drizzle-orm';
import { z } from 'zod';

export const getTotalRevenue = authAction(
  z.object({
    current: z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    }),
    previous: z
      .object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
      .optional(),
  }),
  async ({ current, previous }, { user }) => {
    if (![Role.Admin, Role.Cashier].includes(user.role)) {
      throw new SafeActionError('Forbidden Access');
    }

    const [{ currentRevenue }] = await db
      .select({ currentRevenue: sum(transactionsTable.totalPrice).mapWith(Number) })
      .from(transactionsTable)
      .where(
        and(
          between(
            transactionsTable.createdAt,
            dayjs(current.startDate).toDate(),
            dayjs(current.endDate).toDate()
          ),
          eq(transactionsTable.status, TransactionStatus.Paid),
          isNull(transactionsTable.deletedAt)
        )
      );

    let previousRevenue: number | undefined;

    if (previous) {
      const [record] = await db
        .select({ previousRevenue: sum(transactionsTable.totalPrice).mapWith(Number) })
        .from(transactionsTable)
        .where(
          and(
            between(
              transactionsTable.createdAt,
              dayjs(previous.startDate).toDate(),
              dayjs(previous.endDate).toDate()
            ),
            eq(transactionsTable.status, TransactionStatus.Paid),
            isNull(transactionsTable.deletedAt)
          )
        );
      previousRevenue = record.previousRevenue;
    }

    return {
      currentRevenue,
      previousRevenue,
      increaseInPercentage: getIncreaseInPercentage(previousRevenue || 0, currentRevenue || 0),
    };
  }
);
