'use server';

import { Role } from 'src/constants/common';
import { userKeys, users } from 'src/schema';
import { db } from 'src/utils/db';
import { ProviderId } from 'src/utils/lucia';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import { and, eq, like } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { createKeyId } from 'lucia';
import { z } from 'zod';

export const updateUser = authAction(
  createInsertSchema(users, {
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
      isFirstTimeLogin: true,
    })
    .extend({
      id: z.string().cuid2(),
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
  (params, { session }) => {
    const { id, ...userData } = params;
    const { role, userId } = session.user;
    if (role !== Role.Admin && userId !== params.id) {
      throw new SafeActionError('Forbidden access');
    }

    return db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ ...userData, updatedById: userId })
        .where(eq(users.id, id));

      if (userData.email) {
        await tx
          .update(userKeys)
          .set({
            id: createKeyId(ProviderId.email, userData.email),
          })
          .where(and(like(userKeys.id, `${ProviderId.email}%`), eq(userKeys.userId, id)));
      }
    });
  }
);
