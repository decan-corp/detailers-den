/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */

'use server';

import { Role } from 'src/constants/common';
import { crewEarnings, services, transactionServices, transactions, users } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import cuid2 from '@paralleldrive/cuid2';
import { eq, inArray } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';
import { uniq, uniqBy } from 'lodash';
import { z } from 'zod';

const transactionServicesSchema = z.object({
  serviceBy: z
    .array(z.string().cuid2())
    .min(1)
    .refine(
      (value) => {
        const uniqueUserIds = uniq(value);
        return value.length === uniqueUserIds.length;
      },
      { message: 'List of crews of must be unique' }
    ),
  serviceId: z.string().cuid2(),
});

export const updateTransaction = authAction(
  createSelectSchema(transactions)
    .omit({
      createdById: true,
      updatedById: true,
      deletedById: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      totalPrice: true,
    })
    .merge(
      z.object({
        transactionServices: z
          .array(transactionServicesSchema.extend({ id: z.string().cuid2().optional() }))
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
  async (data, { session }) => {
    const { role, userId } = session.user;

    if (![Role.Admin, Role.Cashier, Role.Accounting].includes(role)) {
      throw new SafeActionError('Forbidden access');
    }

    const { transactionServices: transactionServicesList, ...transactionData } = data;
    return db.transaction(async (tx) => {
      const serviceIds = transactionServicesList.map(({ serviceId }) => serviceId);
      const crewIds = uniq(transactionServicesList.flatMap(({ serviceBy }) => serviceBy));
      const transactionServiceIds = uniq(
        transactionServicesList.map(({ id }) => id || '').filter((id) => Boolean(id))
      );

      const servicesRef = await tx.select().from(services).where(inArray(services.id, serviceIds));
      const usersRef = await tx.select().from(users).where(inArray(users.id, crewIds));
      const crewEarningsRef = await tx
        .select()
        .from(crewEarnings)
        .where(inArray(crewEarnings.transactionServiceId, transactionServiceIds));

      if (serviceIds.length !== servicesRef.length) {
        throw new SafeActionError('Invalid service id');
      }

      let totalPrice = 0;

      for (const transactionService of transactionServicesList) {
        const service = servicesRef.find(({ id }) => id === transactionService.serviceId);
        if (!service) {
          throw new SafeActionError('Invalid transaction service id');
        }

        const updateTransactionService = {
          ...transactionService,
          id: transactionService.id || cuid2.createId(),
          createdById: userId,
          price: String(service.price),
          transactionId: transactionData.id,
        };

        totalPrice += Number(service.price);

        await tx
          .insert(transactionServices)
          .values(updateTransactionService)
          .onDuplicateKeyUpdate({ set: updateTransactionService });

        const highestServiceCut = usersRef.reduce(
          (acc, value) => Math.max(acc, value.serviceCutPercentage || 0),
          0
        );
        const computedServiceCutPercentage =
          highestServiceCut + (service?.serviceCutPercentage || 0);

        for (const crewId of transactionService.serviceBy) {
          const crewEarning = crewEarningsRef.find(
            (earning) =>
              earning.crewId === crewId &&
              earning.transactionServiceId === updateTransactionService.id
          );

          const amount =
            ((computedServiceCutPercentage / 100) * Number(service.price)) /
            transactionService.serviceBy.length;

          const updateCrewEarning = {
            id: crewEarning?.id || cuid2.createId(),
            transactionServiceId: updateTransactionService.id,
            computedServiceCutPercentage,
            crewId,
            amount: String(amount),
            createdById: userId,
          };

          await tx
            .insert(crewEarnings)
            .values(updateCrewEarning)
            .onDuplicateKeyUpdate({ set: updateCrewEarning });
        }
      }

      const discountedPrice = totalPrice - (Number(transactionData.discount) || 0);

      await tx
        .update(transactions)
        .set({
          ...transactionData,
          createdById: userId,
          totalPrice: String(discountedPrice),
        })
        .where(eq(transactions.id, transactionData.id));
    });
  }
);
