import { Role } from 'src/constants/common';
import { INVALID_PASSWORD_FORMAT, passwordRegex } from 'src/constants/passwords';
import { usersTable } from 'src/schema';

import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const userSchema = createInsertSchema(usersTable, {
  name: (schema) => schema.name.min(1).trim(),
  email: (schema) => schema.email.email().min(1).toLowerCase().trim(),
  serviceCutModifier: z.coerce
    .number()
    .int({ message: 'Must not contain decimal values' })
    .min(0)
    .max(100)
    .nullish(),
}).omit({
  createdBy: true,
  updatedBy: true,
  deletedBy: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const createUserSchema = userSchema
  .omit({
    id: true,
    hashedPassword: true,
  })
  .merge(
    z.object({
      password: z.string().min(8, { message: 'Must contain at least 8 characters' }),
      confirmPassword: z.string().min(8, { message: 'Must contain at least 8 characters' }),
    })
  )
  .refine((value) => value.confirmPassword === value.password, {
    message:
      'The passwords you entered do not match. Please ensure that both passwords are identical before proceeding.',
    path: ['confirmPassword'],
  })
  .refine((value) => passwordRegex.test(value.password), {
    message: INVALID_PASSWORD_FORMAT,
    path: ['password'],
  });

export const updateUserSchema = userSchema
  .omit({
    isFirstTimeLogin: true,
    hashedPassword: true,
  })
  .extend({
    id: z.string().cuid2(),
  });

export const updateAccountSchema = userSchema
  .omit({
    isFirstTimeLogin: true,
    hashedPassword: true,
    serviceCutPercentage: true,
    id: true,
    role: true,
    image: true, // not yet supported
  })
  .extend({
    role: z.nativeEnum(Role).optional(),
  });
