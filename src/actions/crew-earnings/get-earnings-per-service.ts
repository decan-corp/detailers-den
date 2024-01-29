'use server';

import { Role } from 'src/constants/common';
import { crewEarningsTable, servicesTable, transactionServicesTable, usersTable } from 'src/schema';
import { db } from 'src/utils/db';
import { authAction } from 'src/utils/safe-action';

import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

export const getEarningsPerService = authAction(z.string().cuid2(), async (transactionId, ctx) => {
  const { userId } = ctx.session;
  const { role } = ctx.user;

  const transactionServiceRecords = await db
    .select({
      id: transactionServicesTable.id,
      transactionId: transactionServicesTable.transactionId,
      price: transactionServicesTable.price,
      serviceCutPercentage: transactionServicesTable.serviceCutPercentage,
      serviceName: servicesTable.serviceName,
    })
    .from(transactionServicesTable)
    .innerJoin(servicesTable, eq(transactionServicesTable.serviceId, servicesTable.id))
    .where(and(eq(transactionServicesTable.transactionId, transactionId)));

  const crewEarningRecords = await db
    .select({
      id: crewEarningsTable.id,
      transactionId: transactionServicesTable.transactionId,
      transactionServiceId: transactionServicesTable.id,
      crewId: crewEarningsTable.crewId,
      computedServiceCutPercentage: crewEarningsTable.computedServiceCutPercentage,
      crewCutPercentage: crewEarningsTable.crewCutPercentage,
      amountEarned: crewEarningsTable.amount,
      crewName: usersTable.name,
      role: usersTable.role,
    })
    .from(crewEarningsTable)
    .innerJoin(
      transactionServicesTable,
      eq(crewEarningsTable.transactionServiceId, transactionServicesTable.id)
    )
    .innerJoin(usersTable, eq(crewEarningsTable.crewId, usersTable.id))
    .where(
      and(
        eq(transactionServicesTable.transactionId, transactionId),
        [Role.Crew, Role.StayInCrew, Role.Detailer, Role.Cashier].includes(role)
          ? eq(usersTable.id, userId)
          : undefined
      )
    );

  return transactionServiceRecords.map((transactionService) => {
    const earningsByService = crewEarningRecords.filter(
      ({ transactionServiceId }) => transactionService.id === transactionServiceId
    );
    return {
      ...transactionService,
      crewEarnings: earningsByService,
    };
  });
});
