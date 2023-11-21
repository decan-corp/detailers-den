type LuciaAuth = import('src/utils/lucia').Auth;
type User = typeof import('src/schema').users.$inferInsert;
/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = LuciaAuth;
  type DatabaseUserAttributes = Omit<User, 'id'>;
  type DatabaseSessionAttributes = {};
}
