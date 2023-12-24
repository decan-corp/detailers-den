'use server';

import { Role, TransactionStatus } from 'src/constants/common';
import { transactions } from 'src/schema';
import { db } from 'src/utils/db';
import { getIncreaseInPercentage } from 'src/utils/formula';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import dayjs from 'dayjs';
import { and, between, eq, sum } from 'drizzle-orm';
import { z } from 'zod';

export const getCurrentMonthRevenue = authAction(z.object({}), async (_data, { session }) => {
  const { role } = session.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden Access');
  }

  const startDate = dayjs().startOf('month');
  const endDate = dayjs().endOf('month');

  const [{ currentMonth }] = await db
    .select({ currentMonth: sum(transactions.totalPrice).mapWith(Number) })
    .from(transactions)
    .where(
      and(
        between(transactions.createdAt, new Date(startDate.format()), new Date(endDate.format())),
        eq(transactions.status, TransactionStatus.Paid)
      )
    );

  const [{ previousMonth }] = await db
    .select({ previousMonth: sum(transactions.totalPrice).mapWith(Number) })
    .from(transactions)
    .where(
      and(
        between(
          transactions.createdAt,
          new Date(startDate.subtract(1, 'month').format()),
          new Date(endDate.subtract(1, 'month').format())
        ),
        eq(transactions.status, TransactionStatus.Paid)
      )
    );

  return {
    currentMonth,
    increaseInPercentage: getIncreaseInPercentage(previousMonth || 0, currentMonth || 0),
  };
});
