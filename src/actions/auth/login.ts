'use server';

import { Role } from 'src/constants/common';
import { AdminRoute } from 'src/constants/routes';
import { usersTable } from 'src/schema';
import { db } from 'src/utils/db';
import { auth } from 'src/utils/lucia';
import { SafeActionError, action } from 'src/utils/safe-action';

import { and, eq, isNull } from 'drizzle-orm';
import { LegacyScrypt } from 'lucia';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Argon2id } from 'oslo/password';
import { z } from 'zod';

export const login = action(
  z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1),
  }),
  async ({ email, password }) => {
    // TODO: implement rate limit using upstash
    const [user] = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.email, email), isNull(usersTable.deletedAt)));

    if (!user) {
      throw new SafeActionError('Incorrect email or password');
    }

    let isPasswordValid: boolean;
    try {
      isPasswordValid = await new Argon2id().verify(user.hashedPassword, password);
    } catch (err) {
      isPasswordValid = false;
    }

    // TODO: remove this once migrated to prod and all users have password reset
    if (!isPasswordValid) {
      isPasswordValid = await new LegacyScrypt().verify(user.hashedPassword, password);
    }

    if (!isPasswordValid) {
      throw new SafeActionError('Incorrect email or password');
    }

    const session = await auth.createSession(user.id, {});
    const sessionCookie = auth.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    if (session && [Role.Crew, Role.StayInCrew, Role.Cashier].includes(user.role)) {
      return redirect(AdminRoute.POS);
    }

    return redirect(AdminRoute.Dashboard);
  }
);
