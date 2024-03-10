import { ModeOfPayment, Role, TransactionStatus, VehicleSize } from './constants/common';

import { createId } from '@paralleldrive/cuid2';
import {
  boolean,
  datetime,
  decimal,
  index,
  int,
  json,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

// TODO: delete file once deployed in prod

const dateSchema = {
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).onUpdateNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
};

const commonSchema = {
  ...dateSchema,
  createdBy: varchar('created_by_id', { length: 255 }),
  updatedBy: varchar('updated_by_id', { length: 255 }),
  deletedBy: varchar('deleted_by_id', { length: 255 }),
};

export const transactionsTable = mysqlTable(
  'transactions',
  {
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
    totalPrice: decimal('total_price', { scale: 2, precision: 8 }).notNull(),
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
    discount: decimal('discount', { scale: 2, precision: 8 }).default('0.00'),
    tip: decimal('tip', { scale: 2, precision: 8 }).default('0.00'),
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
    completedAt: timestamp('completed_at', { mode: 'date' }),
    completedBy: varchar('completed_by', { length: 255 }),
    ...commonSchema,
  },
  (table) => ({
    createdAtIdx: index('created_at_idx').on(table.createdAt),
  })
);

export const usersTable = mysqlTable('users', {
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
  hashedPassword: varchar('hashed_password', {
    length: 255,
  }).notNull(),
  ...commonSchema,
});

export const servicesTable = mysqlTable('services', {
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

export const transactionServicesTable = mysqlTable(
  'transaction_services',
  {
    id: varchar('id', { length: 255 })
      .$defaultFn(() => createId())
      .primaryKey(),
    transactionId: varchar('transaction_id', { length: 255 })
      // .references(() => transactions.id) // TODO: foreign key constraint is not yet supported in planetscale
      .notNull(),
    serviceId: varchar('service_id', { length: 255 })
      // .references(() => services.id) // TODO: foreign key constraint is not yet supported in planetscale
      .notNull(),
    price: decimal('price', { scale: 2, precision: 8 }).notNull(),
    serviceBy: json('service_by').$type<string[]>().notNull(),
    serviceCutPercentage: int('service_cut_percentage').default(0).notNull(),
    ...commonSchema,
  },
  (table) => ({
    createdAtIdx: index('created_at_idx').on(table.createdAt),
    transactionIdIdx: index('transaction_id_idx').on(table.transactionId),
    serviceIdIdx: index('service_id_idx').on(table.serviceId),
  })
);

export const crewEarningsTable = mysqlTable(
  'crew_earnings',
  {
    id: varchar('id', { length: 255 })
      .$defaultFn(() => createId())
      .primaryKey(),
    transactionServiceId: varchar('transaction_service_id', { length: 255 })
      // .references(() => transactionServices.id) // TODO: foreign key constraint is not yet supported in planetscale
      .notNull(),
    crewId: varchar('crew_id', { length: 255 })
      // .references(() => users.id) // TODO: foreign key constraint is not yet supported in planetscale
      .notNull(),
    computedServiceCutPercentage: int('computed_service_cut_percentage'),
    amount: decimal('amount', { scale: 2, precision: 8 }).notNull(),
    crewCutPercentage: int('crew_cut_percentage').default(0).notNull(),
    ...commonSchema,
  },
  (table) => ({
    createdAtIdx: index('created_at_idx').on(table.createdAt),
    transactionServiceIdIdx: index('transaction_service_id_idx').on(table.transactionServiceId),
    crewIdIdx: index('crew_id_idx').on(table.crewId),
  })
);

export const sessionsTable = mysqlTable('sessions', {
  id: varchar('id', {
    length: 255,
  }).primaryKey(),
  userId: varchar('user_id', {
    length: 255,
  }).notNull(),
  // .references(() => userTable.id),
  expiresAt: datetime('expires_at').notNull(),
});

export const resetPasswordTokensTable = mysqlTable('reset_password_tokens', {
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