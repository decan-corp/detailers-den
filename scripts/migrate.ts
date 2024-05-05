/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */

import { serverEnv } from 'src/env/server';
import * as schema from 'src/schema';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

import path from 'path';

const dbClient = neon(serverEnv.DATABASE_URL);
const db = drizzle(dbClient, { schema });

(async () => {
  try {
    await migrate(db, { migrationsFolder: path.join(__dirname, '../drizzle') });
    console.log('Success migrating to database', serverEnv.DATABASE_URL);
    process.exit(0);
  } catch (err) {
    console.error('Failed migrating to database:', err);
    process.exit(1);
  }
})();
