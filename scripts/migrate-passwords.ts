/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */

import { userKeysTable, usersTable } from 'src/schema';
import { db } from 'src/utils/db';

import { eq } from 'drizzle-orm';

const seedDatabase = async () =>
  db.transaction(async (tx) => {
    const userKeys = await tx.select().from(userKeysTable);

    for (const userKey of userKeys) {
      await tx
        .update(usersTable)
        .set({
          hashedPassword: userKey.hashedPassword,
          isFirstTimeLogin: true,
        })
        .where(eq(usersTable.id, userKey.userId));
    }
  });

seedDatabase()
  .then(() => {
    console.log('Success seeding database');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to seed database', err);
    process.exit(1);
  });
