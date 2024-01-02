'use server';

import { Role } from 'src/constants/common';
import { services } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { priceMatrixSchema } from './zod-schema';

import { createInsertSchema } from 'drizzle-zod';

export const addService = authAction(
  createInsertSchema(services, {
    priceMatrix: priceMatrixSchema,
  }).omit({
    createdById: true,
    updatedById: true,
    deletedById: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    id: true,
  }),

  async (data, { session }) => {
    const { role, userId } = session.user;

    if (role !== Role.Admin) {
      throw new SafeActionError('Forbidden access');
    }

    await db.insert(services).values({
      ...data,
      createdById: userId,
    });
  }
);
