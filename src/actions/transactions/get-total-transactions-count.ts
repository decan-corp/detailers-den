'use server';

import { Role, TransactionStatus } from 'src/constants/common';
import { transactions } from 'src/schema';
import { db } from 'src/utils/db';
import { getIncreaseInPercentage } from 'src/utils/formula';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { and, between, count, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';

export const getTotalTransactionCount = authAction(
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

    const [{ currentCount }] = await db
      .select({ currentCount: count() })
      .from(transactions)
      .where(
        and(
          between(transactions.createdAt, current.startDate, current.endDate),
          eq(transactions.status, TransactionStatus.Paid),
          isNull(transactions.deletedAt)
        )
      );

    let previousCount: number | undefined;
    if (previous) {
      const [record] = await db
        .select({ previousCount: count() })
        .from(transactions)
        .where(
          and(
            between(transactions.createdAt, previous.startDate, previous.endDate),
            eq(transactions.status, TransactionStatus.Paid),
            isNull(transactions.deletedAt)
          )
        );
      previousCount = record.previousCount;
    }

    return {
      currentCount,
      previousCount,
      increaseInPercentage: getIncreaseInPercentage(previousCount || 0, currentCount || 0),
    };
  }
);
