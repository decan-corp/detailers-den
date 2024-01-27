import { Role } from 'src/constants/common';
import { users } from 'src/schema';

import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const userSchema = createInsertSchema(users, {})
  .merge(
    z.object({
      email: z.string().min(1).toLowerCase(),
      serviceCutPercentage: z.coerce
        .number()
        .int({ message: 'Must not contain decimal values' })
        .min(0)
        .max(100)
        .nullish(),
    })
  )
  .omit({
    createdById: true,
    updatedById: true,
    deletedById: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  });

export const createUserSchema = userSchema
  .omit({
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
  });

export const updateUserSchema = userSchema
  .omit({
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
  );
