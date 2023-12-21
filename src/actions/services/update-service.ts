'use server';

import { Role } from 'src/constants/common';
import { services } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { priceMatrixSchema } from './add-service';

import { eq } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';

export const updateService = authAction(
  createSelectSchema(services, {
    priceMatrix: priceMatrixSchema,
  }).omit({
    createdById: true,
    updatedById: true,
    deletedById: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  }),
  async (params, { session }) => {
    const { id, ...serviceData } = params;
    const { role, userId } = session.user;

    if (role !== Role.Admin) {
      throw new SafeActionError('Forbidden access');
    }

    await db
      .update(services)
      .set({ ...serviceData, updatedById: userId })
      .where(eq(services.id, id));
  }
);
