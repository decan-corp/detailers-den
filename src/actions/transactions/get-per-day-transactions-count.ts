'use server';

import { Role, TransactionStatus } from 'src/constants/common';
import { transactions } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { and, between, count, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';

export const getPerDayTransactionsCount = authAction(
  z.object({
    startDate: z.date(),
    endDate: z.date(),
  }),
  async ({ startDate, endDate }, { session }) => {
    const { role } = session.user;

    if (role !== Role.Admin) {
      throw new SafeActionError('Forbidden Access');
    }

    const records = await db
      .select({
        day: sql`DATE(CONVERT_TZ(${transactions.createdAt}, 'UTC', 'Asia/Manila'))`.mapWith(String),
        count: count(),
      })
      .from(transactions)
      .where(
        and(
          between(transactions.createdAt, startDate, endDate),
          eq(transactions.status, TransactionStatus.Paid),
          isNull(transactions.deletedAt)
        )
      )
      .groupBy(({ day }) => day)
      .orderBy(({ day }) => day);

    return records;
  }
);
