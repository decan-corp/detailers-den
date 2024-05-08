import { serverEnv } from 'src/env/server';

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

// TODO: soft delete all users in turso db after prod deployment
// TODO: delete file after prod deployment
export const tursoClient = createClient({
  url: serverEnv.TURSO_DATABASE_URL,
  authToken: serverEnv.TURSO_AUTH_TOKEN,
});

export const oldDb = drizzle(tursoClient);
