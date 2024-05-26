import { uniq } from 'lodash';
import { z } from 'zod';

export const transactionServicesSchema = z.object({
  id: z.string().cuid2().optional(),
  serviceBy: z
    .array(
      z.object({
        id: z.string().cuid2(),
        crewId: z.string().min(1, { message: 'Required' }).cuid2(),
        amount: z.union([z.string(), z.number()]).pipe(z.coerce.number().min(0)).optional(),
      })
    )
    .min(1, { message: 'Must contain at least 1 crew entry.' })
    .refine(
      (value) => {
        const uniqueUserIds = uniq(value.map(({ crewId }) => crewId));
        return value.length === uniqueUserIds.length;
      },
      { message: 'List of crews of must be unique' }
    ),
  serviceId: z.string().min(1, { message: 'Required' }).cuid2(),
  price: z.union([z.string(), z.number()]).pipe(z.coerce.number().min(0.01)).optional(),
});
