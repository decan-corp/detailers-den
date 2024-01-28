'use server';

import { TransactionStatus } from 'src/constants/common';
import { transactionsTable } from 'src/schema';
import { db } from 'src/utils/db';
import { authAction } from 'src/utils/safe-action';

import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

export const markAsPaidTransaction = authAction(z.string().cuid2(), async (id, { session }) => {
  const { userId } = session.user;

  await db
    .update(transactionsTable)
    .set({
      status: TransactionStatus.Paid,
      completedAt: sql`CURRENT_TIMESTAMP`,
      completedBy: userId,
    })
    .where(eq(transactionsTable.id, id));
});
