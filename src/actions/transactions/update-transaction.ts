/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

'use server';

import { Role, TransactionStatus } from 'src/constants/common';
import { crewEarnings, services, transactionServices, transactions, users } from 'src/schema';
import { updateTransactionSchema } from 'src/schemas/transactions';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import cuid2 from '@paralleldrive/cuid2';
import dayjs from 'dayjs';
import { and, eq, inArray, notInArray, sql } from 'drizzle-orm';
import { clamp, omit, uniq } from 'lodash';

export const updateTransaction = authAction(updateTransactionSchema, async (data, { session }) => {
  const { role, userId } = session.user;

  if (![Role.Admin, Role.Accounting].includes(role)) {
    delete data.createdAt;
  }

  const [transaction] = await db.select().from(transactions).where(eq(transactions.id, data.id));

  if (!transaction) {
    throw new SafeActionError("Transaction doesn't exist.");
  }

  const updateThresholdDays = 60;
  if (dayjs().diff(dayjs(transaction.createdAt), 'days') > updateThresholdDays) {
    throw new SafeActionError(
      `You may no longer update a transaction that was created more than ${updateThresholdDays} days ago.`
    );
  }

  const crewUpdateThreshold = 20;
  if (
    ![Role.Admin, Role.Cashier].includes(role) &&
    dayjs().diff(dayjs(transaction.createdAt), 'minutes') > crewUpdateThreshold
  ) {
    throw new SafeActionError(
      `You may only update a transaction within ${crewUpdateThreshold} minutes`
    );
  }

  const cashierUpdateThreshold = 120;
  if (
    role === Role.Cashier &&
    dayjs().diff(dayjs(transaction.createdAt), 'minutes') > cashierUpdateThreshold
  ) {
    throw new SafeActionError(
      `You may only update a transaction within ${cashierUpdateThreshold / 60} hours`
    );
  }

  const { transactionServices: transactionServicesList, ...transactionData } = data;
  return db.transaction(async (tx) => {
    const serviceIds = transactionServicesList.map(({ serviceId }) => serviceId);
    const crewIds = uniq(transactionServicesList.flatMap(({ serviceBy }) => serviceBy));
    const transactionServiceIds = uniq(
      transactionServicesList.map(({ id }) => id || '').filter(Boolean)
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
        createdAt: data.createdAt,
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

      for (const crewId of transactionService.serviceBy) {
        const crewEarning = crewEarningsRef.find(
          (earning) =>
            earning.crewId === crewId &&
            earning.transactionServiceId === updateTransactionService.id
        );
        const crew = usersRef.find(({ id }) => crewId === id);

        const computedServiceCutPercentage = clamp(
          ((crew?.serviceCutPercentage || 0) + (service?.serviceCutPercentage || 0)) /
            transactionService.serviceBy.length,
          0,
          100
        );
        const amount = (computedServiceCutPercentage / 100) * Number(priceMatrix.price);

        const updateCrewEarning = {
          id: crewEarning?.id || cuid2.createId(),
          transactionServiceId: updateTransactionService.id,
          computedServiceCutPercentage,
          crewId,
          amount: String(amount),
          createdById: userId,
          createdAt: data.createdAt,
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

      if (transactionService.id) {
        await tx
          .delete(crewEarnings)
          .where(
            and(
              eq(crewEarnings.transactionServiceId, transactionService.id),
              notInArray(crewEarnings.crewId, transactionService.serviceBy)
            )
          );
      }
    }

    const deleteServiceList = await tx
      .select({ id: transactionServices.id })
      .from(transactionServices)
      .where(
        and(
          eq(transactionServices.transactionId, transactionData.id),
          notInArray(transactionServices.id, transactionServiceIds)
        )
      );

    if (deleteServiceList.length) {
      const deleteServiceIds = deleteServiceList.map(({ id }) => id);
      await tx.delete(transactionServices).where(inArray(transactionServices.id, deleteServiceIds));
      await tx
        .delete(crewEarnings)
        .where(inArray(crewEarnings.transactionServiceId, deleteServiceIds));
    }

    if (totalPrice < Number(transactionData.discount)) {
      throw new SafeActionError("Discount can't be higher than the total price.");
    }

    const discountedPrice = totalPrice - (Number(transactionData.discount) || 0);

    await tx
      .update(transactions)
      .set({
        ...transactionData,
        updatedById: userId,
        plateNumber: transactionData.plateNumber.replace(/\s/g, ''),
        totalPrice: String(discountedPrice),
        ...(transactionData.status === TransactionStatus.Paid &&
          transaction.completedAt === null && {
            completedAt: sql`CURRENT_TIMESTAMP`,
            completedBy: userId,
          }),
      })
      .where(eq(transactions.id, transactionData.id));
  });
});
