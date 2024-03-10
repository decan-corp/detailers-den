'use server';

import { Role } from 'src/constants/common';
import { servicesTable } from 'src/schema';
import { createServiceSchema } from 'src/schemas/services';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

export const addService = authAction(createServiceSchema, async (data, ctx) => {
  const { userId } = ctx.session;

  if (ctx.user.role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  await db.insert(servicesTable).values({
    ...data,
    createdBy: userId,
  });
});
