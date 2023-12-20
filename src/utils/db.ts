import { serverEnv } from 'src/env/server';
import * as schema from 'src/schema';

import { drizzle } from 'drizzle-orm/mysql2';
import { PoolOptions, createPool } from 'mysql2/promise';

let poolOptions: PoolOptions;

if (serverEnv.DB_HOST !== 'localhost') {
  poolOptions = {
    host: serverEnv.DB_HOST,
    user: serverEnv.DB_USERNAME,
    password: serverEnv.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: true,
    },
  };
} else {
  poolOptions = {
    host: serverEnv.DB_HOST,
    user: serverEnv.DB_USERNAME,
    password: serverEnv.DB_PASSWORD,
    database: serverEnv.DB_NAME || '',
  };
}

export const pool = createPool(poolOptions);

export const db = drizzle(pool, { schema, mode: 'planetscale' });
