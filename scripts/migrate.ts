/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */

import { serverEnv } from 'src/env/server';
import { db } from 'src/utils/db';

import dotenv from 'dotenv';
import { migrate } from 'drizzle-orm/libsql/migrator';

import path from 'path';

dotenv.config();

// TODO: create script for sqlite local
(async () => {
  try {
    await migrate(db, { migrationsFolder: path.join(__dirname, '../drizzle') });
    console.log('Success migrating to database', serverEnv.TURSO_DATABASE_URL);
    process.exit(0);
  } catch (err) {
    console.error('Failed migrating to database:', err);
    process.exit(1);
  }
})();
