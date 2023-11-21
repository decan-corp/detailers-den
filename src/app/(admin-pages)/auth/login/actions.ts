'use server';

import { AdminRoute } from 'src/constants/routes';
import { users } from 'src/schema';
import { db } from 'src/utils/db';
import { auth } from 'src/utils/lucia';
import { action, authAction } from 'src/utils/safe-action';

import { and, eq, isNull } from 'drizzle-orm';
import { LuciaError } from 'lucia';
import * as context from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export const login = action(
  z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1),
  }),
  async ({ email, password }) => {
    try {
      const key = await auth.useKey('email', email, password);

      const [user] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, key.userId), isNull(users.deletedAt)));

      if (!user) {
        throw Error("User doesn't exist");
      }

      const session = await auth.createSession({
        userId: key.userId,
        attributes: {},
      });

      const authRequest = auth.handleRequest('POST', context);
      authRequest.setSession(session);

      redirect(AdminRoute.Dashboard);
    } catch (error) {
      if (
        error instanceof LuciaError &&
        (error.message === 'AUTH_INVALID_KEY_ID' || error.message === 'AUTH_INVALID_PASSWORD')
      ) {
        throw new Error('Incorrect username or password');
      }
      throw error;
    }
  }
);

export const logout = authAction(z.object({}), async (_input, ctx) => {
  const { sessionId } = ctx.session;

  const authRequest = auth.handleRequest('POST', context);
  await auth.invalidateSession(sessionId);
  authRequest.setSession(null); // delete session cookie
  redirect(AdminRoute.Login);
});
