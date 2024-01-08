import { ModeOfPayment, Role, TransactionStatus, VehicleSize } from './constants/common';

import { createId } from '@paralleldrive/cuid2';
import {
  bigint,
  boolean,
  decimal,
  int,
  json,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

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
  customerName: varchar('customer_name', { length: 255 }),
  status: varchar('status', {
    length: 64,
    enum: [TransactionStatus.Paid, TransactionStatus.Pending, TransactionStatus.Void],
  })
    .notNull()
    .default(TransactionStatus.Pending),
  totalPrice: decimal('total_price', { scale: 2, precision: 5 }).notNull(),
  note: text('note'),
  plateNumber: varchar('plate_number', { length: 12 }).notNull(),
  vehicleSize: varchar('vehicle_size', {
    length: 24,
    enum: [
      VehicleSize.Motorcycle,
      VehicleSize.Small,
      VehicleSize.Medium,
      VehicleSize.Large,
      VehicleSize.ExtraLarge,
    ],
  }).notNull(),
  discount: decimal('discount', { scale: 2, precision: 5 }).default('0.00'),
  tip: decimal('tip', { scale: 2, precision: 5 }).default('0.00'),
  modeOfPayment: varchar('mode_of_payment', {
    length: 64,
    enum: [ModeOfPayment.Cash, ModeOfPayment.BankTransfer, ModeOfPayment.GCash, ModeOfPayment.Maya],
  })
    .notNull()
    .default(ModeOfPayment.Cash),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  completedBy: varchar('completed_by', { length: 255 }),
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
  serviceCutPercentage: int('service_cut_percentage').default(0),
  image: varchar('image', { length: 255 }),
  isFirstTimeLogin: boolean('is_first_time_login').default(true),
  ...commonSchema,
});

export const services = mysqlTable('services', {
  id: varchar('id', { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),
  serviceName: varchar('service_name', { length: 255 }).notNull(),
  description: text('description'),
  serviceCutPercentage: int('service_cut_percentage').default(0).notNull(),
  priceMatrix: json('price_matrix')
    .$type<
      {
        price: number;
        vehicleSize: VehicleSize;
      }[]
    >()
    .notNull(),
  ...commonSchema,
});

export const transactionServices = mysqlTable('transaction_services', {
  id: varchar('id', { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),
  transactionId: varchar('transaction_id', { length: 255 })
    // .references(() => transactions.id) // TODO: foreign key constraint is not yet supported in planetscale
    .notNull(),
  serviceId: varchar('service_id', { length: 255 })
    // .references(() => services.id) // TODO: foreign key constraint is not yet supported in planetscale
    .notNull(),
  price: decimal('price', { scale: 2, precision: 5 }).notNull(),
  serviceBy: json('service_by').$type<string[]>().notNull(),
  ...commonSchema,
});

export const crewEarnings = mysqlTable('crew_earnings', {
  id: varchar('id', { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),
  transactionServiceId: varchar('transaction_service_id', { length: 255 })
    // .references(() => transactionServices.id)
    .notNull(),
  crewId: varchar('crew_id', { length: 255 })
    // .references(() => users.id)
    .notNull(),
  computedServiceCutPercentage: int('computed_service_cut_percentage'),
  amount: decimal('amount', { scale: 2, precision: 5 }).notNull(),
  ...commonSchema,
});

export const userKeys = mysqlTable('user_keys', {
  id: varchar('id', {
    length: 255,
  }).primaryKey(),
  userId: varchar('user_id', {
    length: 255,
  }).notNull(),
  // .references(() => users.id),
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
  }).notNull(),
  // .references(() => users.id),
  activeExpires: bigint('active_expires', {
    mode: 'number',
  }).notNull(),
  idleExpires: bigint('idle_expires', {
    mode: 'number',
  }).notNull(),
  ...dateSchema,
});

export const resetPasswordTokens = mysqlTable('reset_password_tokens', {
  id: varchar('id', { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: varchar('user_id', {
    length: 255,
  }).notNull(),
  // .references(() => users.id),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  isValid: boolean('is_valid').default(true).notNull(),
  ...commonSchema,
});

// TODO: profile
