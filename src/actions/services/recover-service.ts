'use server';

import { Role } from 'src/constants/common';
import { servicesTable } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const recoverService = authAction(z.string().cuid2(), async (id, { session }) => {
  const { role } = session.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  await db
    .update(servicesTable)
    .set({
      deletedById: null,
      deletedAt: null,
    })
    .where(eq(servicesTable.id, id));
});
