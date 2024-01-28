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

import { and, between, desc, eq, isNull, sum } from 'drizzle-orm';
import { z } from 'zod';

export const getCrewEarnings = authAction(
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
          between(crewEarningsTable.createdAt, startDate, endDate),
          eq(transactionsTable.status, TransactionStatus.Paid),
          isNull(transactionsTable.deletedAt)
        )
      )
      .groupBy(({ crewId }) => crewId)
      .orderBy(({ amount }) => desc(amount));

    return records;
  }
);
