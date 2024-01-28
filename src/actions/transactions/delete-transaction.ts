'use server';

import { Role } from 'src/constants/common';
import { transactionsTable } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

export const softDeleteTransaction = authAction(z.string().cuid2(), async (id, { session }) => {
  const { role, userId } = session.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  await db
    .update(transactionsTable)
    .set({
      deletedById: userId,
      deletedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(transactionsTable.id, id));
});

export const recoverTransaction = authAction(z.string().cuid2(), async (id, { session }) => {
  const { role } = session.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  await db
    .update(transactionsTable)
    .set({
      deletedById: null,
      deletedAt: null,
    })
    .where(eq(transactionsTable.id, id));
});
