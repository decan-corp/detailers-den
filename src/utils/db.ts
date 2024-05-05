/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import { serverEnv } from 'src/env/server';
import * as schema from 'src/schema';

import { Pool } from '@neondatabase/serverless';
import { NeonDatabase, drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import { Pool as PgPool } from 'pg';

declare global {
  var globalDb: undefined | NeonDatabase<typeof schema>;
  var globalPool: undefined | Pool;
}

let poolInstance: Pool;
let drizzleInstance: NeonDatabase<typeof schema>;

if (serverEnv.DATABASE_URL.includes('localhost')) {
  poolInstance = new PgPool({ connectionString: serverEnv.DATABASE_URL }) as Pool;
  drizzleInstance = pgDrizzle(poolInstance, { schema });
} else {
  poolInstance = new Pool({ connectionString: serverEnv.DATABASE_URL });
  drizzleInstance = drizzle(poolInstance, { schema });
}

export const pool = globalThis.globalPool ?? poolInstance;
export const db = globalThis.globalDb ?? drizzleInstance;

if (process.env.NODE_ENV !== 'production') {
  globalThis.globalPool = pool;
  globalThis.globalDb = db;
}
