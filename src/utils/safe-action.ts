/* eslint-disable no-console */
import { auth } from './lucia';

import * as context from 'next/headers';
import { createSafeActionClient } from 'next-safe-action';

export const action = createSafeActionClient({
  handleServerErrorLog: (error) => {
    console.error('Action error', error);
  },
});

export const authAction = createSafeActionClient({
  async middleware() {
    const authRequest = auth.handleRequest('GET', context);
    const session = await authRequest.validate();

    if (!session) {
      throw new Error('Session not found!');
    }

    return { session };
  },
  handleServerErrorLog: (error) => {
    console.error('Auth action error', error);
  },
});
