'use server';

import { Role } from 'src/constants/common';
import { crewEarnings, services, transactionServices, users } from 'src/schema';
import { db } from 'src/utils/db';
import { authAction } from 'src/utils/safe-action';

import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

export const getEarningsPerService = authAction(
  z.string().cuid2(),
  async (transactionId, { session }) => {
    const { role, userId } = session.user;

    const transactionServiceRecords = await db
      .select({
        id: transactionServices.id,
        transactionId: transactionServices.transactionId,
        price: transactionServices.price,
        serviceName: services.serviceName,
        serviceCutPercentage: services.serviceCutPercentage,
      })
      .from(transactionServices)
      .innerJoin(services, eq(transactionServices.serviceId, services.id))
      .where(and(eq(transactionServices.transactionId, transactionId)));

    const crewEarningRecords = await db
      .select({
        id: crewEarnings.id,
        transactionId: transactionServices.transactionId,
        transactionServiceId: transactionServices.id,
        crewId: crewEarnings.crewId,
        computedServiceCutPercentage: crewEarnings.computedServiceCutPercentage,
        crewServiceCutPercentage: users.serviceCutPercentage,
        amountEarned: crewEarnings.amount,
        crewName: users.name,
        role: users.role,
      })
      .from(crewEarnings)
      .innerJoin(transactionServices, eq(crewEarnings.transactionServiceId, transactionServices.id))
      .innerJoin(users, eq(crewEarnings.crewId, users.id))
      .where(
        and(
          eq(transactionServices.transactionId, transactionId),
          [Role.Crew, Role.StayInCrew, Role.Detailer, Role.Cashier].includes(role)
            ? eq(users.id, userId)
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
  }
);
