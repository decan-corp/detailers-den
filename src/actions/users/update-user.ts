'use server';

import { Role } from 'src/constants/common';
import { users } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { eq } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const updateUser = authAction(
  createSelectSchema(users, {
    image: (schema) => schema.image.optional(),
    serviceCutPercentage: z.coerce
      .number()
      .int({ message: 'Must not contain decimal values' })
      .min(0)
      .max(100)
      .nullish(),
  })
    .omit({
      createdById: true,
      updatedById: true,
      deletedById: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    })
    .refine(
      (value) => {
        if ([Role.StayInCrew, Role.Crew, Role.Detailer].includes(value.role)) {
          return Boolean(value.serviceCutPercentage);
        }

        return true;
      },
      {
        message: 'Service cut percentage is required for crew, detailer, and stay-in-crew roles.',
        path: ['serviceCutPercentage'],
      }
    ),
  async (params, { session }) => {
    const { id, ...userData } = params;
    const { role, userId } = session.user;
    if (role !== Role.Admin && userId !== params.id) {
      throw new SafeActionError('Forbidden access');
    }

    await db
      .update(users)
      .set({ ...userData, updatedById: userId })
      .where(eq(users.id, id));
  }
);
