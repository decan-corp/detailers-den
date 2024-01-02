'use server';

import { Role, TransactionStatus } from 'src/constants/common';
import { transactions } from 'src/schema';
import { db } from 'src/utils/db';
import { getIncreaseInPercentage } from 'src/utils/formula';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { and, between, eq, isNull, sum } from 'drizzle-orm';
import { z } from 'zod';

export const getTotalRevenue = authAction(
  z.object({
    current: z.object({
      startDate: z.date(),
      endDate: z.date(),
    }),
    previous: z
      .object({
        startDate: z.date(),
        endDate: z.date(),
      })
      .optional(),
  }),
  async ({ current, previous }, { session }) => {
    const { role } = session.user;

    if (role !== Role.Admin) {
      throw new SafeActionError('Forbidden Access');
    }

    const [{ currentRevenue }] = await db
      .select({ currentRevenue: sum(transactions.totalPrice).mapWith(Number) })
      .from(transactions)
      .where(
        and(
          between(transactions.createdAt, current.startDate, current.endDate),
          eq(transactions.status, TransactionStatus.Paid),
          isNull(transactions.deletedAt)
        )
      );

    let previousRevenue: number | undefined;

    if (previous) {
      const [record] = await db
        .select({ previousRevenue: sum(transactions.totalPrice).mapWith(Number) })
        .from(transactions)
        .where(
          and(
            between(transactions.createdAt, previous.startDate, previous.endDate),
            eq(transactions.status, TransactionStatus.Paid),
            isNull(transactions.deletedAt)
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
