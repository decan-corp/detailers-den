'use server';

import { Role } from 'src/constants/common';
import { userKeysTable, usersTable } from 'src/schema';
import { createUserSchema } from 'src/schemas/users';
import { db } from 'src/utils/db';
import { ProviderId } from 'src/utils/lucia';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import cuid2 from '@paralleldrive/cuid2';
import { createKeyId } from 'lucia';
import { generateLuciaPasswordHash } from 'lucia/utils';

export const addUser = authAction(
  createUserSchema,

  (data, { session }) => {
    const { role, userId } = session.user;

    if (role !== Role.Admin) {
      throw new SafeActionError('Forbidden access');
    }

    const { password, ...userData } = data;
    return db.transaction(async (tx) => {
      const id = cuid2.createId();
      await tx.insert(usersTable).values({
        ...userData,
        id,
        createdById: userId,
      });

      const hashedPassword = await generateLuciaPasswordHash(password);

      await tx.insert(userKeysTable).values({
        id: createKeyId(ProviderId.email, userData.email),
        userId: id,
        hashedPassword,
      });
    });
  }
);
