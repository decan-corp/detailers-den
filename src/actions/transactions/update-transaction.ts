/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */

'use server';

import { Role } from 'src/constants/common';
import { crewEarnings, services, transactionServices, transactions, users } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { transactionServicesSchema } from './add-transaction';

import cuid2 from '@paralleldrive/cuid2';
import dayjs from 'dayjs';
import { eq, inArray } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';
import { omit, uniq, uniqBy } from 'lodash';
import { z } from 'zod';

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

    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, data.id));

    if (!transaction) {
      throw new SafeActionError("Transaction doesn't exist.");
    }

    const updateThreshold = 20;
    if (
      role !== Role.Admin &&
      dayjs().diff(dayjs(transaction.createdAt), 'minutes') > updateThreshold
    ) {
      throw new SafeActionError(
        `You may only update a transaction within ${updateThreshold} minutes`
      );
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
        const priceMatrix = service?.priceMatrix.find(
          ({ vehicleSize }) => vehicleSize === transactionData.vehicleSize
        );

        if (!priceMatrix) {
          throw new SafeActionError('Invalid price matrix');
        }

        if (!service) {
          throw new SafeActionError('Invalid transaction service id');
        }

        const updateTransactionService = {
          ...transactionService,
          id: transactionService.id || cuid2.createId(),
          createdById: userId,
          price: String(priceMatrix.price),
          transactionId: transactionData.id,
        };

        totalPrice += Number(priceMatrix.price);

        await tx
          .insert(transactionServices)
          .values(updateTransactionService)
          .onDuplicateKeyUpdate({
            set: {
              ...omit(updateTransactionService, ['createdById']),
              updatedById: userId,
            },
          });

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
            ((computedServiceCutPercentage / 100) * Number(priceMatrix.price)) /
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
            .onDuplicateKeyUpdate({
              set: {
                ...omit(updateCrewEarning, ['createdById']),
                updatedById: userId,
              },
            });
        }
      }

      const discountedPrice = totalPrice - (Number(transactionData.discount) || 0);

      await tx
        .update(transactions)
        .set({
          ...transactionData,
          updatedById: userId,
          totalPrice: String(discountedPrice),
        })
        .where(eq(transactions.id, transactionData.id));
    });
  }
);
