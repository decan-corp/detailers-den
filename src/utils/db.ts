import { serverEnv } from 'src/env/server';
import * as schema from 'src/schema';

import { drizzle } from 'drizzle-orm/mysql2';
import { ConnectionOptions, createConnection } from 'mysql2';

let connectionOptions: ConnectionOptions;

const { NODE_ENV } = process.env;

if (NODE_ENV === 'production') {
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

export const db = drizzle(connection, { schema, mode: 'planetscale' });
