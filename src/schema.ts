import { createId } from '@paralleldrive/cuid2';
import {
  decimal,
  int,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

import type { AdapterAccount } from '@auth/core/adapters';

export const transactions = mysqlTable('transactions', {
  id: varchar('id', { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).onUpdateNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  customerName: varchar('customer_name', { length: 256 }).notNull(),
  status: varchar('status', { length: 64, enum: ['PAID', 'PENDING', 'CANCELLED', 'REFUNDED'] })
    .notNull()
    .default('PENDING'),
  totalPrice: decimal('total_price', { scale: 2, precision: 5 }),
  note: text('note'),
});

export const users = mysqlTable('user', {
  id: varchar('id', { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).onUpdateNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date', fsp: 3 }).defaultNow(),
  password: text('password'),
  image: varchar('image', { length: 255 }),
});

export const accounts = mysqlTable(
  'account',
  {
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 255 }).$type<AdapterAccount['type']>().notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
    refresh_token: varchar('refresh_token', { length: 255 }),
    access_token: varchar('access_token', { length: 255 }),
    expires_at: int('expires_at'),
    token_type: varchar('token_type', { length: 255 }),
    scope: varchar('scope', { length: 255 }),
    id_token: varchar('id_token', { length: 2048 }),
    session_state: varchar('session_state', { length: 255 }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).onUpdateNow(),
    deletedAt: timestamp('deleted_at', { mode: 'date' }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  })
);

export const sessions = mysqlTable('session', {
  sessionToken: varchar('sessionToken', { length: 255 }).notNull().primaryKey(),
  userId: varchar('userId', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).onUpdateNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
});

export const verificationTokens = mysqlTable(
  'verificationToken',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).onUpdateNow(),
    deletedAt: timestamp('deleted_at', { mode: 'date' }),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  })
);
