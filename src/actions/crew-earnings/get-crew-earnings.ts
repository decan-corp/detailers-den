'use server';

import { Role, TransactionStatus } from 'src/constants/common';
import {
  crewEarningsTable,
  transactionServicesTable,
  transactionsTable,
  usersTable,
} from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import dayjs from 'dayjs';
import { and, between, desc, eq, isNull, sum } from 'drizzle-orm';
import { z } from 'zod';

export const getCrewEarnings = authAction(
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
        crewId: crewEarningsTable.crewId,
        crewName: usersTable.name,
        amount: sum(crewEarningsTable.amount).mapWith(Number),
        image: usersTable.image,
        role: usersTable.role,
      })
      .from(crewEarningsTable)
      .innerJoin(usersTable, eq(crewEarningsTable.crewId, usersTable.id))
      .innerJoin(
        transactionServicesTable,
        eq(crewEarningsTable.transactionServiceId, transactionServicesTable.id)
      )
      .innerJoin(
        transactionsTable,
        eq(transactionServicesTable.transactionId, transactionsTable.id)
      )
      .where(
        and(
          between(crewEarningsTable.createdAt, dayjs(startDate).toDate(), dayjs(endDate).toDate()),
          eq(transactionsTable.status, TransactionStatus.Paid),
          isNull(transactionsTable.deletedAt)
        )
      )
      .groupBy(({ crewId, crewName, image, role }) => [crewId, crewName, image, role])
      .orderBy(({ amount }) => desc(amount));

    return records;
  }
);
