'use server';

import { Role } from 'src/constants/common';
import { usersTable } from 'src/schema';
import { db } from 'src/utils/db';
import { auth } from 'src/utils/lucia';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

export const softDeleteUser = authAction(z.string().cuid2(), async (id, { session }) => {
  const { role, userId } = session.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  await db.transaction(async (tx) => {
    await tx
      .update(usersTable)
      .set({
        deletedById: userId,
        deletedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(usersTable.id, id));

    await auth.invalidateAllUserSessions(id);
  });
});

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
