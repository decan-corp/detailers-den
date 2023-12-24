'use server';

import { Role, TransactionStatus } from 'src/constants/common';
import { transactions } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import dayjs from 'dayjs';
import { and, between, eq, isNull, sum } from 'drizzle-orm';
import { z } from 'zod';

export const getYearlyRevenue = authAction(z.object({}), async (_data, { session }) => {
  const { role } = session.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden Access');
  }

  const startDate = dayjs().startOf('year');
  const endDate = dayjs().endOf('year');

  const [{ yearlyRevenue }] = await db
    .select({ yearlyRevenue: sum(transactions.totalPrice).mapWith(Number) })
    .from(transactions)
    .where(
      and(
        between(transactions.createdAt, new Date(startDate.format()), new Date(endDate.format())),
        eq(transactions.status, TransactionStatus.Paid),
        isNull(transactions.deletedAt)
      )
    );

  return yearlyRevenue || 0;
});
