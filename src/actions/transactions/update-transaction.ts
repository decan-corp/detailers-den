/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

'use server';

import { Role, TransactionStatus } from 'src/constants/common';
import {
  crewEarningsTable,
  servicesTable,
  transactionServicesTable,
  transactionsTable,
  usersTable,
} from 'src/schema';
import { updateTransactionSchema } from 'src/schemas/transactions';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import cuid2 from '@paralleldrive/cuid2';
import dayjs from 'dayjs';
import { and, eq, inArray, notInArray } from 'drizzle-orm';
import { clamp, omit, uniq } from 'lodash';

export const updateTransaction = authAction(updateTransactionSchema, async (data, ctx) => {
  const { userId } = ctx.session;
  const { role } = ctx.user;

  if (![Role.Admin, Role.Accounting, Role.Cashier].includes(role)) {
    delete data.createdAt;
  }

  const [transaction] = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.id, data.id));

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

  const cashierUpdateThreshold = 7;
  if (
    role === Role.Cashier &&
    dayjs().diff(dayjs(transaction.createdAt), 'days') > cashierUpdateThreshold
  ) {
    throw new SafeActionError(
      `You may only update a transaction within ${cashierUpdateThreshold} days`
    );
  }

  const { transactionServices: transactionServicesList, ...transactionData } = data;
  return db.transaction(async (tx) => {
    const serviceIds = transactionServicesList.map(({ serviceId }) => serviceId);
    const crewIds = uniq(transactionServicesList.flatMap(({ serviceBy }) => serviceBy)).map(
      ({ crewId }) => crewId
    );
    const transactionServiceIds = uniq(
      transactionServicesList.map(({ id }) => id || '').filter(Boolean)
    );

    const servicesRef = await tx
      .select()
      .from(servicesTable)
      .where(inArray(servicesTable.id, serviceIds));
    const usersRef = await tx.select().from(usersTable).where(inArray(usersTable.id, crewIds));
    const crewEarningsRef = await tx
      .select()
      .from(crewEarningsTable)
      .where(inArray(crewEarningsTable.transactionServiceId, transactionServiceIds));
    const transactionServicesRef = await tx
      .select()
      .from(transactionServicesTable)
      .where(inArray(transactionServicesTable.id, transactionServiceIds));

    if (serviceIds.length !== servicesRef.length) {
      throw new SafeActionError('Invalid service id');
    }

    let totalPrice = 0;

    for (const transactionService of transactionServicesList) {
      const service = servicesRef.find(({ id }) => id === transactionService.serviceId);
      const priceMatrix = service?.priceMatrix.find(
        ({ vehicleSize }) => vehicleSize === transactionData.vehicleSize
      );
      const savedTransactionServiceRef = transactionServicesRef.find(
        ({ id }) => id === transactionService.id
      );
      const serviceCutModifier =
        (savedTransactionServiceRef?.serviceCutPercentage ?? service?.serviceCutPercentage) || 0;

      if (!priceMatrix) {
        throw new SafeActionError('Invalid price matrix');
      }

      if (!service) {
        throw new SafeActionError('Invalid transaction service id');
      }

      const createTransactionService = {
        ...transactionService,
        id: transactionService.id || cuid2.createId(),
        createdBy: userId,
        price: priceMatrix.price,
        transactionId: transactionData.id,
        createdAt: data.createdAt,
        serviceCutPercentage: serviceCutModifier,
        serviceBy: transactionService.serviceBy.map(({ crewId }) => crewId),
      } satisfies typeof transactionServicesTable.$inferInsert;

      totalPrice += Number(priceMatrix.price);

      await tx
        .insert(transactionServicesTable)
        .values(createTransactionService)
        .onConflictDoUpdate({
          target: transactionServicesTable.id,
          set: {
            ...omit(createTransactionService, ['createdBy', 'serviceCutPercentage']),
            updatedBy: userId,
            updatedAt: dayjs().toDate(),
          },
        });

      for (const item of transactionService.serviceBy) {
        const { crewId } = item;
        const crewEarning = crewEarningsRef.find(
          (earning) =>
            earning.crewId === crewId &&
            earning.transactionServiceId === createTransactionService.id
        );
        const crew = usersRef.find(({ id }) => crewId === id);
        const crewCutPercentage =
          (crewEarning?.crewCutPercentage ?? crew?.serviceCutPercentage) || 0;

        const computedServiceCutPercentage = clamp(
          (crewCutPercentage + serviceCutModifier) / transactionService.serviceBy.length,
          0,
          100
        );
        const amount = (computedServiceCutPercentage / 100) * Number(priceMatrix.price);

        const createCrewEarning = {
          id: crewEarning?.id || cuid2.createId(),
          transactionServiceId: createTransactionService.id,
          computedServiceCutPercentage,
          crewCutPercentage,
          crewId,
          amount,
          createdBy: userId,
          createdAt: data.createdAt,
        };

        await tx
          .insert(crewEarningsTable)
          .values(createCrewEarning)
          .onConflictDoUpdate({
            target: crewEarningsTable.id,
            set: {
              ...omit(createCrewEarning, ['createdBy', 'crewCutPercentage']),
              updatedBy: userId,
              updatedAt: dayjs().toDate(),
            },
          });
      }

      if (transactionService.id) {
        const listOfIds = transactionService.serviceBy.map(({ crewId }) => crewId);
        await tx
          .delete(crewEarningsTable)
          .where(
            and(
              eq(crewEarningsTable.transactionServiceId, transactionService.id),
              notInArray(crewEarningsTable.crewId, listOfIds)
            )
          );
      }
    }

    const deleteServiceList = await tx
      .select({ id: transactionServicesTable.id })
      .from(transactionServicesTable)
      .where(
        and(
          eq(transactionServicesTable.transactionId, transactionData.id),
          notInArray(transactionServicesTable.id, transactionServiceIds)
        )
      );

    if (deleteServiceList.length) {
      const deleteServiceIds = deleteServiceList.map(({ id }) => id);
      await tx
        .delete(crewEarningsTable)
        .where(inArray(crewEarningsTable.transactionServiceId, deleteServiceIds));
      await tx
        .delete(transactionServicesTable)
        .where(inArray(transactionServicesTable.id, deleteServiceIds));
    }

    if (totalPrice < Number(transactionData.discount)) {
      throw new SafeActionError("Discount can't be higher than the total price.");
    }

    const discountedPrice = totalPrice - (Number(transactionData.discount) || 0);

    await tx
      .update(transactionsTable)
      .set({
        ...transactionData,
        updatedBy: userId,
        updatedAt: dayjs().toDate(),
        plateNumber: transactionData.plateNumber.replace(/\s/g, ''),
        totalPrice: discountedPrice,
        ...(transactionData.status === TransactionStatus.Paid &&
          transaction.completedAt === null && {
            completedAt: dayjs().toDate(),
            completedBy: userId,
          }),
      })
      .where(eq(transactionsTable.id, transactionData.id));
  });
});
