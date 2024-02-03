/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */

import { crewEarningsTable, transactionServicesTable, usersTable } from 'src/schema';
import { db } from 'src/utils/db';

import { eq } from 'drizzle-orm';

const seedDatabase = async () => {
  await db.transaction(async (tx) => {
    const users = await tx.select().from(usersTable);
    const crewEarnings = await tx.select().from(crewEarningsTable);

    for (const crewEarning of crewEarnings) {
      if (!crewEarning.crewCutPercentage) {
        const crew = users.find(({ id }) => id === crewEarning.crewId);

        if (crew) {
          await tx
            .update(crewEarningsTable)
            .set({
              crewCutPercentage: crew.serviceCutPercentage || 0,
            })
            .where(eq(crewEarningsTable.id, crewEarning.id));
        }
      }
    }
  });

  console.log('Success seeding crewCutPercentage');
  console.log('Starting seeding service cut percentage of transactionServices');

  await db.transaction(async (tx) => {
    const transactionServices = await tx.select().from(transactionServicesTable);
    const crewEarningsRef = await tx.select().from(crewEarningsTable);

    for (const transactionService of transactionServices) {
      const crewEarnings = crewEarningsRef.filter(
        ({ transactionServiceId }) => transactionServiceId === transactionService.id
      );
      const [crewEarning] = crewEarnings;

      if (crewEarning) {
        await tx
          .update(transactionServicesTable)
          .set({
            serviceCutPercentage:
              (crewEarning.computedServiceCutPercentage || 0) * crewEarnings.length -
              crewEarning.crewCutPercentage,
          })
          .where(eq(transactionServicesTable.id, transactionService.id));
      }
    }
  });
};

seedDatabase()
  .then(() => {
    console.log('Success seeding database');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to seed database', err);
    process.exit(1);
  });
