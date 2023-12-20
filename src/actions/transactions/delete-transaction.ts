'use server';

import { Role } from 'src/constants/common';
import { transactions } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

export const softDeleteTransaction = authAction(z.string().cuid2(), async (id, { session }) => {
  const { role, userId } = session.user;

  if (![Role.Admin, Role.Cashier, Role.Accounting].includes(role)) {
    throw new SafeActionError('Forbidden access');
  }

  await db
    .update(transactions)
    .set({
      deletedById: userId,
      deletedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(transactions.id, id));
});

export const recoverTransaction = authAction(z.string().cuid2(), async (id, { session }) => {
  const { role } = session.user;

  if (![Role.Admin, Role.Cashier, Role.Accounting].includes(role)) {
    throw new SafeActionError('Forbidden access');
  }

  await db
    .update(transactions)
    .set({
      deletedById: null,
      deletedAt: null,
    })
    .where(eq(transactions.id, id));
});
