import { createId } from '@paralleldrive/cuid2';
import { decimal, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';

export const transactions = mysqlTable('transactions', {
  id: varchar('id', { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).onUpdateNow(),
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
  customerName: varchar('customer_name', { length: 256 }).notNull(),
  status: varchar('status', { length: 64, enum: ['PAID', 'PENDING', 'CANCELLED', 'REFUNDED'] })
    .notNull()
    .default('PENDING'),
  totalPrice: decimal('total_price', { scale: 2, precision: 5 }),
  note: text('note'),
});
