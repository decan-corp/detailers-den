import { usersTable } from 'src/schema';

export type UserSelect = typeof usersTable.$inferSelect;
export type UserInsert = typeof usersTable.$inferInsert;

export type UserRole = UserSelect['role'];
