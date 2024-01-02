'use server';

import { Role } from 'src/constants/common';
import { AdminRoute } from 'src/constants/routes';
import { users } from 'src/schema';
import { db } from 'src/utils/db';
import { auth } from 'src/utils/lucia';
import { SafeActionError, action } from 'src/utils/safe-action';

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
        .where(and(eq(users.id, key.userId), isNull(users.deletedAt)))
        .limit(1);

      if (!user) {
        throw new SafeActionError("User doesn't exist");
      }

      const session = await auth.createSession({
        userId: key.userId,
        attributes: {},
      });

      const authRequest = auth.handleRequest('POST', context);
      authRequest.setSession(session);

      if (session && [Role.Crew, Role.StayInCrew, Role.Cashier].includes(session?.user.role)) {
        redirect(AdminRoute.POS);
      }

      redirect(AdminRoute.Dashboard);
    } catch (error) {
      if (
        error instanceof LuciaError &&
        (error.message === 'AUTH_INVALID_KEY_ID' || error.message === 'AUTH_INVALID_PASSWORD')
      ) {
        throw new SafeActionError('Incorrect username or password');
      }
      throw error;
    }
  }
);
