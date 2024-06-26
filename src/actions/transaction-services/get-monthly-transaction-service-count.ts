'use server';

import { Role, TransactionStatus } from 'src/constants/common';
import { servicesTable, transactionServicesTable, transactionsTable } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import dayjs from 'dayjs';
import { and, between, count, desc, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';

export const getAvailedServiceCount = authAction(
  z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
  async ({ startDate, endDate }, { user }) => {
    if (![Role.Admin, Role.Cashier].includes(user.role)) {
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
          between(
            transactionServicesTable.createdAt,
            dayjs(startDate).toDate(),
            dayjs(endDate).toDate()
          ),
          eq(transactionsTable.status, TransactionStatus.Paid),
          isNull(transactionsTable.deletedAt)
        )
      )
      .groupBy(({ serviceId, serviceName }) => [serviceId, serviceName])
      .orderBy(({ serviceCount }) => desc(serviceCount));

    return records;
  }
);
