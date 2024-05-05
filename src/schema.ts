import { ModeOfPayment, Role, TransactionStatus, VehicleSize } from './constants/common';

import { createId } from '@paralleldrive/cuid2';
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

const dateSchema = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
};

const commonSchema = {
  ...dateSchema,
  createdBy: varchar('created_by'),
  updatedBy: varchar('updated_by'),
  deletedBy: varchar('deleted_by'),
};

export const usersTable = pgTable('users', {
  id: varchar('id')
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),
  name: varchar('name').notNull(),
  email: varchar('email').notNull().unique(),
  role: varchar('role', {
    length: 64,
    enum: [Role.StayInCrew, Role.Crew, Role.Cashier, Role.Accounting, Role.Detailer, Role.Admin],
  }).notNull(),
  serviceCutPercentage: integer('service_cut_percentage').default(0),
  image: varchar('image'),
  isFirstTimeLogin: boolean('is_first_time_login').notNull().default(true),
  hashedPassword: varchar('hashed_password').notNull(),
  ...commonSchema,
});

export const transactionsTable = pgTable(
  'transactions',
  {
    id: varchar('id')
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),
    customerName: varchar('customer_name'),
    status: varchar('status', {
      enum: [TransactionStatus.Paid, TransactionStatus.Pending, TransactionStatus.Void],
    })
      .notNull()
      .default(TransactionStatus.Pending),
    totalPrice: decimal('total_price', { scale: 2, precision: 10 }).notNull(),
    note: varchar('note'),
    plateNumber: varchar('plate_number').notNull(),
    vehicleSize: varchar('vehicle_size', {
      enum: [
        VehicleSize.Motorcycle,
        VehicleSize.Small,
        VehicleSize.Medium,
        VehicleSize.Large,
        VehicleSize.ExtraLarge,
      ],
    }).notNull(),
    discount: decimal('discount', { scale: 2, precision: 10 }).notNull().default('0'),
    tip: decimal('tip', { scale: 2, precision: 10 }).notNull().default('0'),
    modeOfPayment: varchar('mode_of_payment', {
      length: 64,
      enum: [
        ModeOfPayment.Cash,
        ModeOfPayment.BankTransfer,
        ModeOfPayment.GCash,
        ModeOfPayment.Maya,
      ],
    })
      .notNull()
      .default(ModeOfPayment.Cash),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
    completedBy: varchar('completed_by').references(() => usersTable.id),
    ...commonSchema,
  },
  (table) => ({
    createdAtIdx: index('transaction_created_at_idx').on(table.createdAt),
  })
);

export const servicesTable = pgTable('services', {
  id: varchar('id')
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),
  serviceName: varchar('service_name').notNull(),
  description: text('description'),
  serviceCutPercentage: integer('service_cut_percentage').notNull().default(0),
  priceMatrix: jsonb('price_matrix')
    .$type<
      {
        price: number;
        vehicleSize: VehicleSize;
      }[]
    >()
    .notNull(),
  ...commonSchema,
});

export const transactionServicesTable = pgTable(
  'transaction_services',
  {
    id: varchar('id')
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),
    transactionId: varchar('transaction_id')
      .references(() => transactionsTable.id)
      .notNull(),
    serviceId: varchar('service_id')
      .references(() => servicesTable.id)
      .notNull(),
    price: real('price').notNull(),
    serviceBy: jsonb('service_by').$type<string[]>().notNull(),
    serviceCutPercentage: integer('service_cut_percentage').notNull().default(0),
    ...commonSchema,
  },
  (table) => ({
    createdAtIdx: index('transaction_service_created_at_idx').on(table.createdAt),
    transactionIdIdx: index('transaction_service_transaction_id_idx').on(table.transactionId),
    serviceIdIdx: index('transaction_service_service_id_idx').on(table.serviceId),
  })
);

export const crewEarningsTable = pgTable(
  'crew_earnings',
  {
    id: varchar('id')
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),
    transactionServiceId: varchar('transaction_service_id')
      .references(() => transactionServicesTable.id)
      .notNull(),
    crewId: varchar('crew_id')
      .references(() => usersTable.id)
      .notNull(),
    computedServiceCutPercentage: decimal('computed_service_cut_percentage', {
      scale: 2,
      precision: 10,
    }).notNull(),
    amount: decimal('amount', { scale: 2, precision: 10 }).notNull(),
    crewCutPercentage: integer('crew_cut_percentage').notNull().default(0),
    ...commonSchema,
  },
  (table) => ({
    createdAtIdx: index('crew_earning_created_at_idx').on(table.createdAt),
    transactionServiceIdIdx: index('crew_earning_transaction_service_id_idx').on(
      table.transactionServiceId
    ),
    crewIdIdx: index('crew_earning_crew_id_idx').on(table.crewId),
  })
);

export const sessionsTable = pgTable('sessions', {
  id: varchar('id').primaryKey(),
  userId: varchar('user_id', {
    length: 255,
  })
    .notNull()
    .references(() => usersTable.id),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
});

export const resetPasswordTokensTable = pgTable('reset_password_tokens', {
  id: varchar('id')
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),
  userId: varchar('user_id')
    .references(() => usersTable.id)
    .notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
  isValid: boolean('is_valid').notNull().default(true),
  ...commonSchema,
});

// TODO: profile
