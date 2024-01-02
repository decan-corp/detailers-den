import { users } from 'src/schema';

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export type UserRole = UserSelect['role'];
