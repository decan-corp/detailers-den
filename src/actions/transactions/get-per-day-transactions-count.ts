'use server';

import { Role, TransactionStatus } from 'src/constants/common';
import { transactionsTable } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { and, between, count, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';

export const getPerDayTransactionsCount = authAction(
  z.object({
    startDate: z.date(),
    endDate: z.date(),
  }),
  async ({ startDate, endDate }, { user }) => {
    if (user.role !== Role.Admin) {
      throw new SafeActionError('Forbidden Access');
    }

    const records = await db
      .select({
        day: sql`DATE(CONVERT_TZ(${transactionsTable.createdAt}, 'UTC', 'Asia/Manila'))`.mapWith(
          String
        ),
        count: count(),
      })
      .from(transactionsTable)
      .where(
        and(
          between(transactionsTable.createdAt, startDate, endDate),
          eq(transactionsTable.status, TransactionStatus.Paid),
          isNull(transactionsTable.deletedAt)
        )
      )
      .groupBy(({ day }) => day)
      .orderBy(({ day }) => day);

    return records;
  }
);
