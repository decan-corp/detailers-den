import { sessionsTable, usersTable } from 'src/schema';

import { db } from './db';

import { DrizzleMySQLAdapter } from '@lucia-auth/adapter-drizzle';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Lucia, TimeSpan } from 'lucia';

import { webcrypto } from 'node:crypto';

dayjs.extend(duration);

globalThis.crypto = webcrypto as Crypto;

const adapter = new DrizzleMySQLAdapter(db, sessionsTable, usersTable);

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
  getUserAttributes: (attributes) =>
    ({
      email: attributes.email,
      role: attributes.role,
      name: attributes.name,
      image: attributes.image,
      isFirstTimeLogin: attributes.isFirstTimeLogin,
    }) satisfies DatabaseUserAttributes,
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
