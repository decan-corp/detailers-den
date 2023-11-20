import { authOptions } from 'src/app/api/auth/[...nextauth]/route';

import { getServerSession } from 'next-auth';
import { createSafeActionClient } from 'next-safe-action';

export const authAction = createSafeActionClient({
  async middleware() {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new Error('Session not found!');
    }

    return { session };
  },
  handleServerErrorLog: (error) => {
    // eslint-disable-next-line no-console
    console.error('Action error', error);
  },
});
