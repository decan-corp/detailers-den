/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import { serverEnv } from 'src/env/server';

import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { createConnection } from 'mysql2';

import path from 'path';

const connection = createConnection({
  host: serverEnv.DB_HOST,
  user: serverEnv.DB_USERNAME,
  password: serverEnv.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: true,
  },
});
const db = drizzle(connection);

const init = async () => {
  try {
    await migrate(db, { migrationsFolder: path.join(__dirname, '../drizzle') });
    console.log('Success migrating to database');
    process.exit(0);
  } catch (err) {
    console.error('Failed to database migration', err);
    process.exit(1);
  }
};

init();
