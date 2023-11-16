import NextAuth from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';
import { users } from 'src/schema';

type UserType = typeof users.$inferSelect;
declare module 'next-auth' {
  interface Session {
    // define your custom fields here for token
    user: {
      id: string;
      email: string;
      name: string;
      image: UserType['image'];
      role: UserType['role'];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: UserType['role'];
    image: UserType['image'];
  }
}
