'use server';

import { Role, TransactionStatus } from 'src/constants/common';
import { transactionsTable } from 'src/schema';
import { db } from 'src/utils/db';
import { getIncreaseInPercentage } from 'src/utils/formula';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import dayjs from 'dayjs';
import { and, between, count, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';

export const getTotalTransactionCount = authAction(
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
    const { role } = user;

    if (![Role.Admin, Role.Cashier].includes(role)) {
      throw new SafeActionError('Forbidden Access');
    }

    const [{ currentCount }] = await db
      .select({ currentCount: count() })
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

    let previousCount: number | undefined;
    if (previous) {
      const [record] = await db
        .select({ previousCount: count() })
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
      previousCount = record.previousCount;
    }

    return {
      currentCount,
      previousCount,
      increaseInPercentage: getIncreaseInPercentage(previousCount || 0, currentCount || 0),
    };
  }
);
