'use server';

import { Role } from 'src/constants/common';
import { userKeysTable, usersTable } from 'src/schema';
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
      .update(usersTable)
      .set({ ...userData, updatedById: userId })
      .where(eq(usersTable.id, id));

    if (userData.email) {
      await tx
        .update(userKeysTable)
        .set({
          id: createKeyId(ProviderId.email, userData.email),
        })
        .where(and(like(userKeysTable.id, `${ProviderId.email}%`), eq(userKeysTable.userId, id)));
    }
  });
});
