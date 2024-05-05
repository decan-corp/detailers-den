/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */

import { serverEnv } from 'src/env/server';
import * as schema from 'src/schema';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import { migrate as pgMigrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool as PgPool } from 'pg';

import path from 'path';

(async () => {
  try {
    if (serverEnv.DATABASE_URL.includes('localhost')) {
      console.log('running localhost pg migrator');
      const dbClient = new PgPool({ connectionString: serverEnv.DATABASE_URL });
      const db = pgDrizzle(dbClient, { schema });
      await pgMigrate(db, { migrationsFolder: path.join(__dirname, '../drizzle') });
    } else {
      const dbClient = neon(serverEnv.DATABASE_URL);
      const db = drizzle(dbClient, { schema });
      await migrate(db, { migrationsFolder: path.join(__dirname, '../drizzle') });
    }

    console.log('Success migrating to database');
    process.exit(0);
  } catch (err) {
    console.error('Failed migrating to database:', err);
    process.exit(1);
  }
})();
