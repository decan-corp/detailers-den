import { transactions } from 'src/schema';

import { transactionServicesSchema } from './transaction-services';

import dayjs from 'dayjs';
import { createInsertSchema } from 'drizzle-zod';
import { uniqBy } from 'lodash';
import { z } from 'zod';

export const transactionSchema = createInsertSchema(transactions)
  .merge(
    z.object({
      plateNumber: z.string().toUpperCase(),
      discount: z.coerce
        .number()
        .transform((value) => String(value))
        .optional(),
      tip: z.coerce
        .number()
        .transform((value) => String(value))
        .optional(),
      transactionServices: z
        .array(transactionServicesSchema)
        .min(1)
        .refine(
          (value) => {
            const uniqueServiceIds = uniqBy(value, 'serviceId');
            return value.length === uniqueServiceIds.length;
          },
          { message: 'Service must be unique.' }
        ),
    })
  )
  .omit({
    createdById: true,
    updatedById: true,
    deletedById: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    totalPrice: true,
    completedAt: true,
    completedBy: true,
  });

export const createTransactionSchema = transactionSchema.omit({
  id: true,
});

export const updateTransactionSchema = transactionSchema.merge(
  z.object({
    id: z.string().cuid2(),
    createdAt: z.coerce
      .date({ invalid_type_error: 'Invalid date and time format.' })
      .max(dayjs().toDate(), 'Please select a date and time on or before today.')
      .min(
        dayjs().subtract(60, 'days').startOf('day').toDate(),
        'Please enter a date and time within the current year.'
      )
      .nullish(),
    transactionServices: z
      .array(transactionServicesSchema.extend({ id: z.string().cuid2().optional() }))
      .min(1)
      .refine(
        (value) => {
          const uniqueServiceIds = uniqBy(value, 'serviceId');
          return value.length === uniqueServiceIds.length;
        },
        {
          message: 'Service must be unique',
        }
      ),
  })
);
