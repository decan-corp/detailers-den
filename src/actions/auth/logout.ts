'use server';

import { AdminRoute } from 'src/constants/routes';
import { auth } from 'src/utils/lucia';
import { authAction } from 'src/utils/safe-action';

import * as context from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export const logout = authAction(z.object({}), async (_input, ctx) => {
  const { sessionId, user } = ctx.session;

  const authRequest = auth.handleRequest('POST', context);
  await auth.invalidateSession(sessionId);
  await auth.deleteDeadUserSessions(user.userId);
  authRequest.setSession(null); // delete session cookie
  redirect(AdminRoute.Login);
});
