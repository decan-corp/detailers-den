'use server';

import { Role, TransactionStatus } from 'src/constants/common';
import { crewEarnings, transactionServices, transactions, users } from 'src/schema';
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
        crewId: crewEarnings.crewId,
        crewName: users.name,
        amount: sum(crewEarnings.amount).mapWith(Number),
        image: users.image,
        role: users.role,
      })
      .from(crewEarnings)
      .innerJoin(users, eq(crewEarnings.crewId, users.id))
      .innerJoin(transactionServices, eq(crewEarnings.transactionServiceId, transactionServices.id))
      .innerJoin(transactions, eq(transactionServices.transactionId, transactions.id))
      .where(
        and(
          between(crewEarnings.createdAt, startDate, endDate),
          eq(transactions.status, TransactionStatus.Paid),
          isNull(transactions.deletedAt)
        )
      )
      .groupBy(({ crewId }) => crewId)
      .orderBy(({ amount }) => desc(amount));

    return records;
  }
);
