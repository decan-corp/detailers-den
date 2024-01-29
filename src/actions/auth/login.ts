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
import { Scrypt } from 'oslo/password';
import { z } from 'zod';

export const login = action(
  z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1),
  }),
  async ({ email, password }) => {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.email, email), isNull(usersTable.deletedAt)));

    if (!user) {
      throw new SafeActionError('Incorrect email or password');
    }

    // TODO: remove default empty string after prod deployment and after making hashed password not null
    let isPasswordValid = await new Scrypt().verify(user.hashedPassword || '', password);

    // eslint-disable-next-line no-console
    console.log('isPasswordValid', isPasswordValid);

    // TODO: remove this once migrated to prod and all users has password reset
    if (!isPasswordValid) {
      isPasswordValid = await new LegacyScrypt().verify(user.hashedPassword || '', password);
      // eslint-disable-next-line no-console
      console.log('2isPasswordValid', isPasswordValid);
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
