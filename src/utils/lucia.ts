import 'lucia/polyfill/node';

import { pool } from './db';

import { mysql2 } from '@lucia-auth/adapter-mysql';
import { lucia } from 'lucia';
import { nextjs_future } from 'lucia/middleware';

export const auth = lucia({
  adapter: mysql2(pool, {
    user: 'users',
    key: 'user_keys',
    session: 'user_sessions',
  }),
  env: process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV',
  middleware: nextjs_future(),
  sessionCookie: {
    expires: false,
  },
  getUserAttributes: (data) => ({
    email: data.email,
    role: data.role,
    name: data.name,
    image: data.image,
  }),
});

export type Auth = typeof auth;
export enum ProviderId {
  email = 'email',
}
