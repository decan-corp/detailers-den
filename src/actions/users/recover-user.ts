'use server';

import { Role } from 'src/constants/common';
import { usersTable } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const recoverUser = authAction(z.string().cuid2(), async (id, { session }) => {
  const { role } = session.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  await db
    .update(usersTable)
    .set({
      deletedById: null,
      deletedAt: null,
    })
    .where(eq(usersTable.id, id));
});
