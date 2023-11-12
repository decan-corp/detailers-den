import { serverEnv } from 'src/env/server';

import { drizzle } from 'drizzle-orm/mysql2';
import { createConnection } from 'mysql2';

const connection = createConnection({
  host: serverEnv.DB_HOST,
  user: serverEnv.DB_USERNAME,
  password: serverEnv.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: true,
  },
});

export const db = drizzle(connection);
