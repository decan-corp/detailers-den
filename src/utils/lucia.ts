import 'lucia/polyfill/node';

import { pool } from './db';

import { mysql2 } from '@lucia-auth/adapter-mysql';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { camelCase } from 'lodash';
import { lucia } from 'lucia';
import { nextjs_future } from 'lucia/middleware';

dayjs.extend(duration);

const transformDbAttributes = <T extends Record<string, unknown>>(data: T): T =>
  Object.entries(data).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [camelCase(key)]: value,
    }),
    {}
  ) as T;

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
  sessionExpiresIn: {
    activePeriod: dayjs.duration(1, 'days').as('milliseconds'),
    idlePeriod: dayjs.duration(7, 'days').as('milliseconds'),
  },
  getUserAttributes: (data) => {
    const userData = transformDbAttributes(data);
    return {
      email: userData.email,
      role: userData.role,
      name: userData.name,
      image: userData.image,
      isFirstTimeLogin: Boolean(userData.isFirstTimeLogin),
    };
  },
});

export type Auth = typeof auth;
export enum ProviderId {
  email = 'email',
}
