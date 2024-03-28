import { usersTable } from 'src/schema';

import { tursoClient } from './db';

import { LibSQLAdapter } from '@lucia-auth/adapter-sqlite';
import { camelCase } from 'lodash';
import { Lucia, TimeSpan } from 'lucia';

import { webcrypto } from 'node:crypto';

globalThis.crypto = webcrypto as Crypto;

const transformDbColumns = <T extends Record<string, unknown>>(data: T): T =>
  Object.entries(data).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [camelCase(key)]: value,
    }),
    {}
  ) as T;

const adapter = new LibSQLAdapter(tursoClient, {
  user: 'users',
  session: 'sessions',
});
export const auth = new Lucia(adapter, {
  sessionCookie: {
    // this sets cookies with super long expiration
    // since Next.js doesn't allow Lucia to extend cookie expiration when rendering pages
    name: 'session',
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  },
  sessionExpiresIn: new TimeSpan(3, 'd'),
  // getSessionAttributes: (attributes) => ({}),
  getUserAttributes: (attributes) => {
    const userData = transformDbColumns(attributes);
    return {
      email: userData.email,
      role: userData.role,
      name: userData.name,
      image: userData.image,
      isFirstTimeLogin: Boolean(userData.isFirstTimeLogin),
    } satisfies DatabaseUserAttributes;
  },
});

// IMPORTANT!
interface DatabaseSessionAttributes {}

type DatabaseUserAttributes = Pick<
  typeof usersTable.$inferSelect,
  'email' | 'role' | 'name' | 'image' | 'isFirstTimeLogin'
>;

declare module 'lucia' {
  interface Register {
    Lucia: typeof auth;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}
