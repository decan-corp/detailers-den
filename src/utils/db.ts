import { serverEnv } from 'src/env/server';

import { connect } from '@planetscale/database';
import { drizzle } from 'drizzle-orm/planetscale-serverless';

// create the connection
const connection = connect({
  host: serverEnv.DB_HOST,
  username: serverEnv.DB_USERNAME,
  password: serverEnv.DB_PASSWORD,
});

export const db = drizzle(connection);
