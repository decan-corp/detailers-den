/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */

import { serverEnv } from 'src/env/server';
import * as schema from 'src/schema';

import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { ConnectionOptions, createConnection } from 'mysql2';

import path from 'path';

let connectionOptions: ConnectionOptions;

if (serverEnv.DB_HOST !== 'localhost') {
  connectionOptions = {
    host: serverEnv.DB_HOST,
    user: serverEnv.DB_USERNAME,
    password: serverEnv.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: true,
    },
  };
} else {
  connectionOptions = {
    host: serverEnv.DB_HOST,
    user: serverEnv.DB_USERNAME,
    password: serverEnv.DB_PASSWORD,
    database: serverEnv.DB_NAME || '',
  };
}

const connection = createConnection(connectionOptions);
const db = drizzle(connection, { schema, mode: 'planetscale' });

const init = async () => {
  try {
    await migrate(db, { migrationsFolder: path.join(__dirname, '../drizzle') });
    console.log('Success migrating to database', serverEnv.DB_HOST);
    process.exit(0);
  } catch (err) {
    console.error('Failed migrating to database', err);
    process.exit(1);
  }
};

init();
