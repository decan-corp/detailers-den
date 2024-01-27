'use server';

import { Role } from 'src/constants/common';
import { userKeys, users } from 'src/schema';
import { updateUserSchema } from 'src/schemas/users';
import { db } from 'src/utils/db';
import { ProviderId } from 'src/utils/lucia';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { and, eq, like } from 'drizzle-orm';
import { createKeyId } from 'lucia';

export const updateUser = authAction(updateUserSchema, (params, { session }) => {
  const { id, ...userData } = params;
  const { role, userId } = session.user;
  if (role !== Role.Admin && userId !== params.id) {
    throw new SafeActionError('Forbidden access');
  }

  return db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ ...userData, updatedById: userId })
      .where(eq(users.id, id));

    if (userData.email) {
      await tx
        .update(userKeys)
        .set({
          id: createKeyId(ProviderId.email, userData.email),
        })
        .where(and(like(userKeys.id, `${ProviderId.email}%`), eq(userKeys.userId, id)));
    }
  });
});
