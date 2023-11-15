import { users } from 'src/schema';
import { db } from 'src/utils/db';

import { DrizzleAdapter } from '@auth/drizzle-adapter';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// TODO: create register api
// TODO: when in login page, redirect to admin home page if user is already authenticated
// TODO: when in protected page, redirect to login page if user is not authenticated
const handler = NextAuth({
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
  callbacks: {
    jwt({ token }) {
      return token;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
});

export { handler as GET, handler as POST };
