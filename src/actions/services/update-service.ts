'use server';

import { Role } from 'src/constants/common';
import { services } from 'src/schema';
import { updateServiceSchema } from 'src/schemas/services';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { eq } from 'drizzle-orm';

export const updateService = authAction(updateServiceSchema, async (params, { session }) => {
  const { id, ...serviceData } = params;
  const { role, userId } = session.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  await db
    .update(services)
    .set({ ...serviceData, updatedById: userId })
    .where(eq(services.id, id));
});
