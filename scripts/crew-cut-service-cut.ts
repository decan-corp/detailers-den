/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */

import { crewEarningsTable, transactionServicesTable, usersTable } from 'src/schema';
import { db } from 'src/utils/db';

import { eq } from 'drizzle-orm';

const seedDatabase = async () => {
  const users = await db.select().from(usersTable);
  const crewEarnings = await db.select().from(crewEarningsTable);

  for (const crewEarning of crewEarnings) {
    if (!crewEarning.crewCutPercentage) {
      const crew = users.find(({ id }) => id === crewEarning.crewId);

      if (crew) {
        await db
          .update(crewEarningsTable)
          .set({
            crewCutPercentage: crew.serviceCutPercentage || 0,
          })
          .where(eq(crewEarningsTable.id, crewEarning.id));
      }
    }
  }

  console.log('Success seeding crewCutPercentage');
  console.log('Starting seeding service cut percentage of transactionServices');

  const transactionServices = await db.select().from(transactionServicesTable);
  const crewEarningsRef = await db.select().from(crewEarningsTable);

  for (const transactionService of transactionServices) {
    const modifiedCrewEarnings = crewEarningsRef.filter(
      ({ transactionServiceId }) => transactionServiceId === transactionService.id
    );
    const [crewEarning] = modifiedCrewEarnings;

    if (crewEarning) {
      await db
        .update(transactionServicesTable)
        .set({
          serviceCutPercentage:
            (crewEarning.computedServiceCutPercentage || 0) * modifiedCrewEarnings.length -
            crewEarning.crewCutPercentage,
        })
        .where(eq(transactionServicesTable.id, transactionService.id));
    }
  }
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
