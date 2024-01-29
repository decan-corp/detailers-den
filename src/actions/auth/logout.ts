'use server';

import { AdminRoute } from 'src/constants/routes';
import { auth } from 'src/utils/lucia';
import { authAction } from 'src/utils/safe-action';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export const logout = authAction(z.object({}), async (_input, ctx) => {
  const { id } = ctx.session;

  const sessionCookie = auth.createBlankSessionCookie();
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  await auth.invalidateSession(id);
  await auth.deleteExpiredSessions();

  return redirect(AdminRoute.Login);
});
