import { transactionsTable } from 'src/schema';

import { transactionServicesSchema } from './transaction-services';

import dayjs from 'dayjs';
import { createInsertSchema } from 'drizzle-zod';
import { uniqBy } from 'lodash';
import { z } from 'zod';

export const transactionSchema = createInsertSchema(transactionsTable)
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
      .nullish()
      .refine(
        (value) => {
          // eslint-disable-next-line no-console
          console.log('is within 60 days', {
            value: dayjs(value).format(),
            validation: dayjs(value).isAfter(dayjs().subtract(60, 'days').startOf('day')),
          });
          return dayjs(value).isAfter(dayjs().subtract(60, 'days').startOf('day'));
        },
        {
          message: 'Please enter a date and time within the past 60 days.',
        }
      )
      .refine(
        (value) => {
          // eslint-disable-next-line no-console
          console.log('is not a future date and time', {
            value: dayjs(value).format(),
            now: dayjs().format(),
            validation: dayjs(value).isBefore(dayjs()),
          });
          return dayjs(value).isBefore(dayjs());
        },
        {
          message: 'Please select a date and time on or before today.',
        }
      ),
    // .max(dayjs().toDate(), 'Please select a date and time on or before today.')
    // .min(
    //   dayjs().subtract(60, 'days').startOf('day').toDate(),
    //   'Please enter a date and time within the past 60 days.'
    // )
    // .nullish(),
    transactionServices: z
      .array(
        transactionServicesSchema.extend({
          id: z.string().cuid2().optional(),
        })
      )
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
