/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */

import { db } from 'src/utils/db';

import { migrate } from 'drizzle-orm/mysql2/migrator';

import path from 'path';

const init = async () => {
  try {
    await migrate(db, { migrationsFolder: path.join(__dirname, '../drizzle') });
    console.log('Success migrating to database');
    process.exit(0);
  } catch (err) {
    console.error('Failed migrating to database', err);
    process.exit(1);
  }
};

init();
