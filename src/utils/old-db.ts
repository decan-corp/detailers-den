/* eslint-disable vars-on-top */
/* eslint-disable no-var */
import { serverEnv } from 'src/env/server';
import * as schema from 'src/schema';

import { MySql2Database, drizzle } from 'drizzle-orm/mysql2';
import { PoolOptions, createPool, Pool } from 'mysql2/promise';

let poolOptions: PoolOptions;

declare global {
  var globalDb: undefined | MySql2Database<typeof schema>;
  var globalPool: undefined | Pool;
}

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

export const pool = globalThis.globalPool ?? createPool(poolOptions);

export const mysqlDb = globalThis.globalDb ?? drizzle(pool, { schema, mode: 'planetscale' });

if (process.env.NODE_ENV !== 'production') {
  globalThis.globalDb = mysqlDb;
  globalThis.globalPool = pool;
}
