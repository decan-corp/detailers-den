'use server';

import { Role, TransactionStatus } from 'src/constants/common';
import { servicesTable, transactionServicesTable, transactionsTable } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { and, between, count, desc, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';

export const getAvailedServiceCount = authAction(
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
        serviceId: transactionServicesTable.serviceId,
        serviceName: servicesTable.serviceName,
        serviceCount: count(),
      })
      .from(transactionServicesTable)
      .innerJoin(servicesTable, eq(transactionServicesTable.serviceId, servicesTable.id))
      .innerJoin(
        transactionsTable,
        eq(transactionServicesTable.transactionId, transactionsTable.id)
      )
      .where(
        and(
          between(transactionServicesTable.createdAt, startDate, endDate),
          eq(transactionsTable.status, TransactionStatus.Paid),
          isNull(transactionsTable.deletedAt)
        )
      )
      .groupBy(({ serviceId, serviceName }) => [serviceId, serviceName])
      .orderBy(({ serviceCount }) => desc(serviceCount));

    return records;
  }
);
