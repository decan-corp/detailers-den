'use server';

import { Role } from 'src/constants/common';
import { services } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { priceMatrixSchema } from './zod-schema';

import { eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const updateService = authAction(
  createInsertSchema(services, {
    priceMatrix: priceMatrixSchema,
  })
    .omit({
      createdById: true,
      updatedById: true,
      deletedById: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    })
    .extend({
      id: z.string().cuid2(),
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
