import { Role } from './constants/roles';

import { createId } from '@paralleldrive/cuid2';
import { bigint, decimal, int, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';

const dateSchema = {
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).onUpdateNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
};

const commonSchema = {
  ...dateSchema,
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
  ...commonSchema,
});

export const users = mysqlTable('users', {
  id: varchar('id', { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: varchar('role', {
    length: 64,
    enum: [Role.StayInCrew, Role.Crew, Role.Cashier, Role.Accounting, Role.Detailer, Role.Admin],
  }).notNull(),
  serviceCutPercentage: int('service_cut_percentage'),
  image: varchar('image', { length: 255 }),
  ...commonSchema,
});

export const services = mysqlTable('services', {
  id: varchar('id', { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),
  serviceName: varchar('service_name', { length: 255 }).notNull(),
  price: decimal('price', { scale: 2, precision: 5 }).notNull(),
  description: text('description'),
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

export const userKeys = mysqlTable('user_keys', {
  id: varchar('id', {
    length: 255,
  }).primaryKey(),
  userId: varchar('user_id', {
    length: 255,
  })
    .notNull()
    .references(() => users.id),
  hashedPassword: varchar('hashed_password', {
    length: 255,
  }),
  ...dateSchema,
});

export const userSessions = mysqlTable('user_sessions', {
  id: varchar('id', {
    length: 128,
  }).primaryKey(),
  userId: varchar('user_id', {
    length: 255,
  })
    .notNull()
    .references(() => users.id),
  activeExpires: bigint('active_expires', {
    mode: 'number',
  }).notNull(),
  idleExpires: bigint('idle_expires', {
    mode: 'number',
  }).notNull(),
  ...dateSchema,
});
