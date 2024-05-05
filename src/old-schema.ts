import { ModeOfPayment, Role, TransactionStatus, VehicleSize } from './constants/common';

import { createId } from '@paralleldrive/cuid2';
import { index, sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// TODO: delete file after production deployment
const dateSchema = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }),
};

const commonSchema = {
  ...dateSchema,
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
};

export const usersTable = sqliteTable('users', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role', {
    length: 64,
    enum: [Role.StayInCrew, Role.Crew, Role.Cashier, Role.Accounting, Role.Detailer, Role.Admin],
  }).notNull(),
  serviceCutPercentage: integer('service_cut_percentage', { mode: 'number' }).default(0),
  image: text('image'),
  isFirstTimeLogin: integer('is_first_time_login', { mode: 'boolean' }).default(true),
  hashedPassword: text('hashed_password', {
    length: 255,
  }).notNull(),
  ...commonSchema,
});

export const transactionsTable = sqliteTable(
  'transactions',
  {
    id: text('id')
      .$defaultFn(() => createId())
      .primaryKey(),
    customerName: text('customer_name'),
    status: text('status', {
      enum: [TransactionStatus.Paid, TransactionStatus.Pending, TransactionStatus.Void],
    })
      .notNull()
      .default(TransactionStatus.Pending),
    totalPrice: real('total_price').notNull(),
    note: text('note'),
    plateNumber: text('plate_number', { length: 12 }).notNull(),
    vehicleSize: text('vehicle_size', {
      enum: [
        VehicleSize.Motorcycle,
        VehicleSize.Small,
        VehicleSize.Medium,
        VehicleSize.Large,
        VehicleSize.ExtraLarge,
      ],
    }).notNull(),
    discount: real('discount').notNull().default(0),
    tip: real('tip').notNull().default(0),
    modeOfPayment: text('mode_of_payment', {
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
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
    completedBy: text('completed_by').references(() => usersTable.id),
    ...commonSchema,
  },
  (table) => ({
    createdAtIdx: index('transaction_created_at_idx').on(table.createdAt),
  })
);

export const servicesTable = sqliteTable('services', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  serviceName: text('service_name').notNull(),
  description: text('description'),
  serviceCutPercentage: integer('service_cut_percentage', { mode: 'number' }).default(0).notNull(),
  priceMatrix: text('price_matrix', { mode: 'json' })
    .$type<
      {
        price: number;
        vehicleSize: VehicleSize;
      }[]
    >()
    .notNull(),
  ...commonSchema,
});

export const transactionServicesTable = sqliteTable(
  'transaction_services',
  {
    id: text('id')
      .$defaultFn(() => createId())
      .primaryKey(),
    transactionId: text('transaction_id')
      .references(() => transactionsTable.id)
      .notNull(),
    serviceId: text('service_id')
      .references(() => servicesTable.id)
      .notNull(),
    price: real('price').notNull(),
    serviceBy: text('service_by', { mode: 'json' }).$type<string[]>().notNull(),
    serviceCutPercentage: integer('service_cut_percentage', { mode: 'number' })
      .default(0)
      .notNull(),
    ...commonSchema,
  },
  (table) => ({
    createdAtIdx: index('transaction_service_created_at_idx').on(table.createdAt),
    transactionIdIdx: index('transaction_service_transaction_id_idx').on(table.transactionId),
    serviceIdIdx: index('transaction_service_service_id_idx').on(table.serviceId),
  })
);

export const crewEarningsTable = sqliteTable(
  'crew_earnings',
  {
    id: text('id')
      .$defaultFn(() => createId())
      .primaryKey(),
    transactionServiceId: text('transaction_service_id')
      .references(() => transactionServicesTable.id)
      .notNull(),
    crewId: text('crew_id')
      .references(() => usersTable.id)
      .notNull(),
    computedServiceCutPercentage: integer('computed_service_cut_percentage', { mode: 'number' }),
    amount: real('amount').notNull(),
    crewCutPercentage: integer('crew_cut_percentage', { mode: 'number' }).default(0).notNull(),
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

export const sessionsTable = sqliteTable('sessions', {
  id: text('id', {
    length: 255,
  }).primaryKey(),
  userId: text('user_id', {
    length: 255,
  })
    .notNull()
    .references(() => usersTable.id),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
});

export const resetPasswordTokensTable = sqliteTable('reset_password_tokens', {
  id: text('id', { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text('user_id')
    .references(() => usersTable.id)
    .notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  isValid: integer('is_valid', { mode: 'boolean' }).default(true).notNull(),
  ...commonSchema,
});

// TODO: profile
