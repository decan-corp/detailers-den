import { serverEnv } from 'src/env/server';

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

export const tursoClient = createClient({
  url: serverEnv.TURSO_DATABASE_URL,
  authToken: serverEnv.TURSO_AUTH_TOKEN,
});

export const db = drizzle(tursoClient);
