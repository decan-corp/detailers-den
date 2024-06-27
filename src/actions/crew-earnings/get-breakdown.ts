'use server';

import { TransactionStatus, managerialRole } from 'src/constants/common';
import {
  crewEarningsTable,
  servicesTable,
  transactionServicesTable,
  transactionsTable,
} from 'src/schema';
import { db } from 'src/utils/db';
import { authAction } from 'src/utils/safe-action';

import dayjs from 'dayjs';
import { and, between, desc, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';

export const getCrewEarningsBreakdown = authAction(
  z.object({
    crewId: z.string().cuid2(),
    createdAt: z.object({
      from: z.string().datetime(),
      to: z.string().datetime(),
    }),
  }),
  async ({ createdAt, crewId }, ctx) => {
    let crewIdFilter = crewId;

    if (!managerialRole.includes(ctx.user.role)) {
      crewIdFilter = ctx.user.id;
    }

    const earnings = await db
      .select({
        customerName: transactionsTable.customerName,
        plateNumber: transactionsTable.plateNumber,
        vehicleSize: transactionsTable.vehicleSize,
        amount: crewEarningsTable.amount,
        computedServiceCutPercentage: crewEarningsTable.computedServiceCutPercentage,
        crewCutPercentage: crewEarningsTable.crewCutPercentage,
        serviceName: servicesTable.serviceName,
        price: transactionServicesTable.price,
        createdAt: transactionsTable.createdAt,
      })
      .from(crewEarningsTable)
      .innerJoin(
        transactionServicesTable,
        eq(transactionServicesTable.id, crewEarningsTable.transactionServiceId)
      )
      .innerJoin(servicesTable, eq(servicesTable.id, transactionServicesTable.serviceId))
      .innerJoin(
        transactionsTable,
        eq(transactionsTable.id, transactionServicesTable.transactionId)
      )
      .where(
        and(
          between(
            crewEarningsTable.createdAt,
            dayjs(createdAt.from).toDate(),
            dayjs(createdAt.to).toDate()
          ),
          eq(transactionsTable.status, TransactionStatus.Paid),
          isNull(transactionsTable.deletedAt),
          eq(crewEarningsTable.crewId, crewIdFilter)
        )
      )
      .orderBy(desc(transactionsTable.createdAt));

    return earnings;
  }
);
