'use server';

import { Role } from 'src/constants/common';
import { crewEarningsTable, transactionServicesTable, transactionsTable } from 'src/schema';
import { db } from 'src/utils/db';
import { authAction } from 'src/utils/safe-action';

import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';

export const getEditTransactionData = authAction(z.string().cuid2(), async (transactionId, ctx) => {
  const { role } = ctx.user;
  const [transaction] = await db
    .select()
    .from(transactionsTable)
    .where(and(eq(transactionsTable.id, transactionId), isNull(transactionsTable.deletedAt)))
    .limit(1);

  if (!transaction) {
    return undefined;
  }

  const transactionServiceRecords = await db
    .select({
      id: transactionServicesTable.id,
      serviceId: transactionServicesTable.serviceId,
      price: transactionServicesTable.price,
    })
    .from(transactionServicesTable)
    .where(eq(transactionServicesTable.transactionId, transactionId));

  const crewEarningRecords = await db
    .select({
      id: crewEarningsTable.id,
      crewId: crewEarningsTable.crewId,
      transactionServiceId: crewEarningsTable.transactionServiceId,
      ...([Role.Admin, Role.Accountant].includes(role) && {
        amount: crewEarningsTable.amount,
      }),
    })
    .from(crewEarningsTable)
    .innerJoin(
      transactionServicesTable,
      eq(transactionServicesTable.id, crewEarningsTable.transactionServiceId)
    )
    .where(eq(transactionServicesTable.transactionId, transactionId));

  return {
    ...transaction,
    transactionServices: transactionServiceRecords.map((transactionService) => {
      const earningsByService = crewEarningRecords.filter(
        ({ transactionServiceId }) => transactionService.id === transactionServiceId
      );
      return {
        ...transactionService,
        serviceBy: earningsByService,
      };
    }),
  };
});
