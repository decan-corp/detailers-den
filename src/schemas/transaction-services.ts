import { uniq } from 'lodash';
import { z } from 'zod';

export const transactionServicesSchema = z.object({
  serviceBy: z
    .array(z.string().cuid2())
    .min(1)
    .refine(
      (value) => {
        const uniqueUserIds = uniq(value);
        return value.length === uniqueUserIds.length;
      },
      { message: 'List of crews of must be unique' }
    ),
  serviceId: z.string().cuid2(),
});
