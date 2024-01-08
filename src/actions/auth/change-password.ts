'use server';

import { ProviderId, auth } from 'src/utils/lucia';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { LuciaError } from 'lucia';
import { z } from 'zod';

export const changePassword = authAction(
  z
    .object({
      currentPassword: z.string().min(6, { message: 'Must contain at least 6 characters' }),
      newPassword: z.string().min(6, { message: 'Must contain at least 6 characters' }),
      confirmPassword: z.string().min(6, { message: 'Must contain at least 6 characters' }),
    })
    .refine((value) => value.confirmPassword === value.newPassword, {
      message:
        'The passwords you entered do not match. Please ensure that both passwords are identical before proceeding.',
      path: ['confirmPassword'],
    })
    .refine((value) => value.currentPassword !== value.newPassword, {
      message: 'New password must be different from the current password.',
      path: ['newPassword'],
    }),

  async (data, { session }) => {
    const { email, userId } = session.user;

    try {
      await auth.useKey(ProviderId.email, email, data.currentPassword);
    } catch (error) {
      if (
        error instanceof LuciaError &&
        (error.message === 'AUTH_INVALID_KEY_ID' || error.message === 'AUTH_INVALID_PASSWORD')
      ) {
        throw new SafeActionError('Incorrect current password');
      }
      throw error;
    }

    await auth.updateKeyPassword(ProviderId.email, email, data.newPassword);
    await auth.invalidateAllUserSessions(userId);
  }
);
