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

const commonSchema = {
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).onUpdateNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  createdById: varchar('created_by_id', { length: 255 }),
  updatedById: varchar('updated_by_id', { length: 255 }),
  deletedById: varchar('deleted_by_id', { length: 255 }),
};

export const transactions = mysqlTable('transactions', {
  id: varchar('id', { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  status: varchar('status', {
    length: 64,
    enum: ['PAID', 'PENDING', 'CANCELLED', 'REFUNDED', 'VOID'],
  })
    .notNull()
    .default('PENDING'),
  totalPrice: decimal('total_price', { scale: 2, precision: 5 }).notNull(),
  note: text('note'),
  plateNumber: varchar('plate_number', { length: 7 }),
  vehicleType: varchar('vehicle_type', {
    length: 24,
    enum: ['mc', 'small', 'medium', 'large', 'x-large'],
  }).notNull(),
  discount: decimal('discount', { scale: 2, precision: 5 }),
  // files: // TODO: array of files
  ...commonSchema,
});

export const services = mysqlTable('services', {
  id: varchar('id', { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),
  serviceName: varchar('service_name', { length: 255 }).notNull(),
  price: decimal('price', { scale: 2, precision: 5 }),
  description: text('description'),
  serviceCutPercentage: int('service_cut_percentage').notNull(), // TODO:
  ...commonSchema,
});

export const users = mysqlTable('user', {
  id: varchar('id', { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),
  role: varchar('role', {
    length: 64,
    enum: ['stay-in-crew', 'crew', 'cashier', 'accounting', 'detailer', 'admin'],
  }).notNull(),
  serviceCutPercentage: int('service_cut_percentage'), // TODO:
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date', fsp: 3 }).defaultNow(),
  password: text('password'),
  image: varchar('image', { length: 255 }),
  ...commonSchema,
});

export const transaction_services = mysqlTable(
  'transaction_services',
  {
    id: varchar('id', { length: 255 })
      .$defaultFn(() => createId())
      .primaryKey(),
    transactionId: varchar('transaction_id', { length: 255 })
      .references(() => transactions.id)
      .notNull(),
    serviceId: varchar('service_id', { length: 255 })
      .references(() => services.id)
      .notNull(),
    serviceById: varchar('service_by_id', { length: 255 })
      .references(() => users.id)
      .notNull(),
    ...commonSchema,
  },
  () => ({})
);

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
