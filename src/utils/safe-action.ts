/* eslint-disable no-console */
import { validateRequest } from 'src/components/auth/validate-request';

import { createSafeActionClient } from 'next-safe-action';

export class SafeActionError extends Error {}

const handleReturnedServerError = (e: Error) => {
  if (e instanceof SafeActionError) {
    return e.message;
  }

  return 'An error occurred while performing the requested action.';
};

export const action = createSafeActionClient({
  handleServerErrorLog: (error) => {
    console.error('Action error', error);
  },
  handleReturnedServerError,
});

export const authAction = createSafeActionClient({
  async middleware() {
    const { session, user } = await validateRequest();

    if (!session) {
      throw new Error('Session not found!');
    }

    return { session, user };
  },
  handleServerErrorLog: (error) => {
    console.error('Auth action error', error);
  },
  handleReturnedServerError,
});
