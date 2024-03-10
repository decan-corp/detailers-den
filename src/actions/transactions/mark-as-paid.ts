'use server';

import { TransactionStatus } from 'src/constants/common';
import { transactionsTable } from 'src/schema';
import { db } from 'src/utils/db';
import { authAction } from 'src/utils/safe-action';

import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const markAsPaidTransaction = authAction(z.string().cuid2(), async (id, { session }) => {
  const { userId } = session;

  await db
    .update(transactionsTable)
    .set({
      status: TransactionStatus.Paid,
      completedAt: dayjs().toDate(),
      completedBy: userId,
    })
    .where(eq(transactionsTable.id, id));
});
