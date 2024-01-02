'use server';

import { Role } from 'src/constants/common';
import { userKeys, users } from 'src/schema';
import { db } from 'src/utils/db';
import { ProviderId } from 'src/utils/lucia';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import cuid2 from '@paralleldrive/cuid2';
import { createInsertSchema } from 'drizzle-zod';
import { createKeyId } from 'lucia';
import { generateLuciaPasswordHash } from 'lucia/utils';
import { z } from 'zod';

export const addUser = authAction(
  createInsertSchema(users, {
    email: (schema) => schema.email.toLowerCase(),
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
      id: true,
    })
    .merge(
      z.object({
        password: z.string().min(6, { message: 'Must contain at least 6 characters' }),
        confirmPassword: z.string().min(6, { message: 'Must contain at least 6 characters' }),
      })
    )
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
    )
    .refine((value) => value.confirmPassword === value.password, {
      message:
        'The passwords you entered do not match. Please ensure that both passwords are identical before proceeding.',
      path: ['confirmPassword'],
    }),

  (data, { session }) => {
    const { role, userId } = session.user;

    if (role !== Role.Admin) {
      throw new SafeActionError('Forbidden access');
    }

    const { password, ...userData } = data;
    return db.transaction(async (tx) => {
      const id = cuid2.createId();
      await tx.insert(users).values({
        ...userData,
        id,
        createdById: userId,
      });

      const hashedPassword = await generateLuciaPasswordHash(password);

      await tx.insert(userKeys).values({
        id: createKeyId(ProviderId.email, userData.email),
        userId: id,
        hashedPassword,
      });
    });
  }
);
