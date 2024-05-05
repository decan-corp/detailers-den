/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import { serverEnv } from 'src/env/server';
import * as schema from 'src/schema';

import { Pool } from '@neondatabase/serverless';
import { NeonDatabase, drizzle } from 'drizzle-orm/neon-serverless';

declare global {
  var globalDb: undefined | NeonDatabase<typeof schema>;
  var globalPool: undefined | Pool;
}

export const pool = globalThis.globalPool ?? new Pool({ connectionString: serverEnv.DATABASE_URL });
export const db = globalThis.globalDb ?? drizzle(pool, { schema });

if (process.env.NODE_ENV !== 'production') {
  globalThis.globalPool = pool;
  globalThis.globalDb = db;
}
