'use server';

import { Role, TransactionStatus } from 'src/constants/common';
import { transactionsTable } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import dayjs from 'dayjs';
import { and, between, count, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';

export const getPerDayTransactionsCount = authAction(
  z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
  async ({ startDate, endDate }, { user }) => {
    if (user.role !== Role.Admin) {
      throw new SafeActionError('Forbidden Access');
    }

    const records = await db
      .select({
        day: sql`TO_CHAR(${transactionsTable.createdAt} AT TIME ZONE 'Asia/Manila', 'YYYY-MM-DD')`.mapWith(
          String
        ),
        count: count(),
      })
      .from(transactionsTable)
      .where(
        and(
          between(transactionsTable.createdAt, dayjs(startDate).toDate(), dayjs(endDate).toDate()),
          eq(transactionsTable.status, TransactionStatus.Paid),
          isNull(transactionsTable.deletedAt)
        )
      )
      .groupBy(({ day }) => day)
      .orderBy(({ day }) => day);

    return records;
  }
);
