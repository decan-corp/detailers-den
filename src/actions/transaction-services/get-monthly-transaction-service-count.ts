'use server';

import { Role, TransactionStatus } from 'src/constants/common';
import { services, transactionServices, transactions } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { and, between, count, desc, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';

export const getAvailedServiceCount = authAction(
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
        serviceId: transactionServices.serviceId,
        serviceName: services.serviceName,
        serviceCount: count(),
      })
      .from(transactionServices)
      .innerJoin(services, eq(transactionServices.serviceId, services.id))
      .innerJoin(transactions, eq(transactionServices.transactionId, transactions.id))
      .where(
        and(
          between(transactionServices.createdAt, startDate, endDate),
          eq(transactions.status, TransactionStatus.Paid),
          isNull(transactions.deletedAt)
        )
      )
      .groupBy(({ serviceId }) => serviceId)
      .orderBy(({ serviceCount }) => desc(serviceCount));

    return records;
  }
);
