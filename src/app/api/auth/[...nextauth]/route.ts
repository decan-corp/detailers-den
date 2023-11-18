import { users } from 'src/schema';
import { db } from 'src/utils/db';

import { DrizzleAdapter } from '@auth/drizzle-adapter';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// TODO: create register api
export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'Email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, _req) {
        const { email, password } = credentials || {};
        if (!email || !password) {
          throw new Error('Missing required parameters');
        }

        const [user] = await db.select().from(users).where(eq(users.email, email));

        if (!user) {
          throw new Error("User doesn't exist");
        }

        if (!user.password) {
          throw new Error("User doesn't support password credentials");
        }

        /**
         * Bcrypt isn't available in all environments hence we're using bcryptjs instead.
         * Reference: https://stackoverflow.com/a/66729173 for more info.
         */
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 14, // 14 days
  },
  callbacks: {
    jwt({ token, user }) {
      // TODO: validate if user is still valid not deleted
      // if so, remove cookies to force logout user.
      // Check by adding timestamp on cookies,
      // once expired, check user on database if still active or not.
      const userFromDb = user as typeof users.$inferSelect;

      if (userFromDb) {
        token.role = userFromDb.role;
        token.image = userFromDb.image;
      }

      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      session.user.image = token.image;

      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
