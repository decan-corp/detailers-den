'use server';

import { Role } from 'src/constants/common';
import { transactionsTable } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const recoverTransaction = authAction(z.string().cuid2(), async (id, ctx) => {
  const { role } = ctx.user;

  if (![Role.Admin, Role.Cashier, Role.Accounting].includes(role)) {
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
