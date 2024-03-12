import { INVALID_PASSWORD_FORMAT, passwordRegex } from 'src/constants/passwords';

import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Must contain at least 1 characters' }),
    newPassword: z.string().min(8, { message: 'Must contain at least 8 characters' }),
    confirmPassword: z.string().min(8, { message: 'Must contain at least 8 characters' }),
  })
  .refine((value) => value.confirmPassword === value.newPassword, {
    message:
      'The passwords you entered do not match. Please ensure that both passwords are identical before proceeding.',
    path: ['confirmPassword'],
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: 'New password must be different from the current password.',
    path: ['newPassword'],
  })
  .refine((value) => passwordRegex.test(value.newPassword), {
    message: INVALID_PASSWORD_FORMAT,
    path: ['newPassword'],
  });

export const resetPasswordSchema = z
  .object({
    resetPasswordTokenId: z.string().cuid2(),
    password: z.string().min(8, { message: 'Must contain at least 8 characters' }),
    confirmPassword: z.string().min(8, { message: 'Must contain at least 8 characters' }),
  })
  .refine((value) => value.confirmPassword === value.password, {
    message:
      'The passwords you entered do not match. Please ensure that both passwords are identical before proceeding.',
    path: ['confirmPassword'],
  })
  .refine((value) => passwordRegex.test(value.password), {
    message: INVALID_PASSWORD_FORMAT,
    path: ['password'],
  });
