/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */

'use server';

import { TransactionStatus } from 'src/constants/common';
import { crewEarnings, services, transactionServices, transactions, users } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { transactionServicesSchema } from './zod-schema';

import cuid2 from '@paralleldrive/cuid2';
import { inArray, sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { clamp, uniq, uniqBy } from 'lodash';
import { z } from 'zod';

export const addTransaction = authAction(
  createInsertSchema(transactions)
    .omit({
      createdById: true,
      updatedById: true,
      deletedById: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      id: true,
      totalPrice: true,
      completedAt: true,
      completedBy: true,
    })
    .merge(
      z.object({
        transactionServices: z
          .array(transactionServicesSchema)
          .min(1)
          .refine(
            (value) => {
              const uniqueServiceIds = uniqBy(value, 'serviceId');
              return value.length === uniqueServiceIds.length;
            },
            {
              message: 'Service must be unique',
            }
          ),
      })
    ),
  (data, { session }) => {
    const { userId } = session.user;

    const { transactionServices: transactionServicesList, ...transactionData } = data;
    return db.transaction(async (tx) => {
      const transactionId = cuid2.createId();
      const serviceIds = transactionServicesList.map(({ serviceId }) => serviceId);
      const crewIds = uniq(transactionServicesList.flatMap(({ serviceBy }) => serviceBy));

      const servicesRef = await tx.select().from(services).where(inArray(services.id, serviceIds));
      const usersRef = await tx.select().from(users).where(inArray(users.id, crewIds));

      if (serviceIds.length !== servicesRef.length) {
        throw new SafeActionError('Invalid service id');
      }

      const insertTransactionServicesData: (typeof transactionServices.$inferInsert)[] = [];
      const insertCrewEarnings: (typeof crewEarnings.$inferInsert)[] = [];

      for (const transactionService of transactionServicesList) {
        const service = servicesRef.find(({ id }) => id === transactionService.serviceId);
        const priceMatrix = service?.priceMatrix.find(
          ({ vehicleSize }) => vehicleSize === transactionData.vehicleSize
        );

        if (!priceMatrix) {
          throw new SafeActionError('Invalid price matrix');
        }

        if (!service) {
          throw new SafeActionError('Invalid transaction service id');
        }

        const transactionServiceId = cuid2.createId();
        insertTransactionServicesData.push({
          ...transactionService,
          id: transactionServiceId,
          createdById: userId,
          price: String(priceMatrix.price),
          transactionId,
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

      const discountedPrice = totalPrice - (Number(transactionData.discount) || 0);

      await tx.insert(transactions).values({
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
      await tx.insert(transactionServices).values(insertTransactionServicesData);
      await tx.insert(crewEarnings).values(insertCrewEarnings);
    });
  }
);
