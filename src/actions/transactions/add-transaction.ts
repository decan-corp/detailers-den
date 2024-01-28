/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */

'use server';

import { TransactionStatus } from 'src/constants/common';
import {
  crewEarningsTable,
  servicesTable,
  transactionServicesTable,
  transactionsTable,
  usersTable,
} from 'src/schema';
import { createTransactionSchema } from 'src/schemas/transactions';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import cuid2 from '@paralleldrive/cuid2';
import { inArray, sql } from 'drizzle-orm';
import { clamp, uniq } from 'lodash';

export const addTransaction = authAction(createTransactionSchema, (data, { session }) => {
  const { userId } = session.user;

  const { transactionServices: transactionServicesList, ...transactionData } = data;
  return db.transaction(async (tx) => {
    const transactionId = cuid2.createId();
    const serviceIds = transactionServicesList.map(({ serviceId }) => serviceId);
    const crewIds = uniq(transactionServicesList.flatMap(({ serviceBy }) => serviceBy));

    const servicesRef = await tx
      .select()
      .from(servicesTable)
      .where(inArray(servicesTable.id, serviceIds));
    const usersRef = await tx.select().from(usersTable).where(inArray(usersTable.id, crewIds));

    if (serviceIds.length !== servicesRef.length) {
      throw new SafeActionError('Invalid service id');
    }

    const insertTransactionServicesData: (typeof transactionServicesTable.$inferInsert)[] = [];
    const insertCrewEarnings: (typeof crewEarningsTable.$inferInsert)[] = [];

    for (const transactionService of transactionServicesList) {
      const service = servicesRef.find(({ id }) => id === transactionService.serviceId);
      const priceMatrix = service?.priceMatrix.find(
        ({ vehicleSize }) => vehicleSize === transactionData.vehicleSize
      );

      if (!priceMatrix) {
        throw new SafeActionError('Invalid price matrix.');
      }

      if (!service) {
        throw new SafeActionError('Invalid transaction service id.');
      }

      const transactionServiceId = cuid2.createId();
      insertTransactionServicesData.push({
        ...transactionService,
        id: transactionServiceId,
        createdById: userId,
        price: String(priceMatrix.price),
        transactionId,
        serviceCutPercentage: service.serviceCutPercentage,
      });

      transactionService.serviceBy.forEach((crewId) => {
        const crew = usersRef.find(({ id }) => crewId === id);

        const computedServiceCutPercentage = clamp(
          ((crew?.serviceCutPercentage || 0) + (service?.serviceCutPercentage || 0)) /
            transactionService.serviceBy.length,
          0,
          100
        );
        const amount = (computedServiceCutPercentage / 100) * Number(priceMatrix.price);

        insertCrewEarnings.push({
          transactionServiceId,
          computedServiceCutPercentage,
          crewId,
          amount: String(amount),
          createdById: userId,
        });
      });
    }
    const totalPrice = insertTransactionServicesData.reduce(
      (total, value) => total + Number(value.price),
      0
    );

    if (totalPrice < Number(transactionData.discount)) {
      throw new SafeActionError("Discount can't be higher than the total price.");
    }

    const discountedPrice = totalPrice - (Number(transactionData.discount) || 0);

    await tx.insert(transactionsTable).values({
      ...transactionData,
      id: transactionId,
      createdById: userId,
      plateNumber: transactionData.plateNumber.replace(/\s/g, ''),
      totalPrice: String(discountedPrice),
      ...(transactionData.status === TransactionStatus.Paid && {
        completedAt: sql`CURRENT_TIMESTAMP`,
        completedBy: userId,
      }),
    });
    await tx.insert(transactionServicesTable).values(insertTransactionServicesData);
    await tx.insert(crewEarningsTable).values(insertCrewEarnings);
  });
});
