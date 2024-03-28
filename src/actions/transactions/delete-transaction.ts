'use server';

import { Role } from 'src/constants/common';
import { transactionsTable } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const softDeleteTransaction = authAction(z.string().cuid2(), async (id, ctx) => {
  const { userId } = ctx.session;

  if (ctx.user.role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  await db
    .update(transactionsTable)
    .set({
      deletedBy: userId,
      deletedAt: dayjs().toDate(),
    })
    .where(eq(transactionsTable.id, id));
});

export const recoverTransaction = authAction(z.string().cuid2(), async (id, { user }) => {
  if (user.role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  await db
    .update(transactionsTable)
    .set({
      deletedBy: null,
      deletedAt: null,
    })
    .where(eq(transactionsTable.id, id));
});
