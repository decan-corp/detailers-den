import { VehicleSize } from 'src/constants/common';
import { services } from 'src/schema';

import { createInsertSchema } from 'drizzle-zod';
import { uniqBy } from 'lodash';
import { z } from 'zod';

const priceMatrixSchema = z
  .array(
    z.object({
      price: z.number().int().min(1),
      vehicleSize: z.nativeEnum(VehicleSize),
    })
  )
  .refine(
    (value) => {
      const uniquePriceMatrix = uniqBy(value, 'vehicleSize');
      return uniquePriceMatrix.length === value.length;
    },
    {
      message: 'Vehicle Sizes must be unique',
      path: ['priceMatrix'],
    }
  );

const serviceSchema = createInsertSchema(services, {
  priceMatrix: priceMatrixSchema,
}).omit({
  createdById: true,
  updatedById: true,
  deletedById: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const createServiceSchema = serviceSchema.omit({
  id: true,
});

export const updateServiceSchema = serviceSchema.extend({
  id: z.string().cuid2(),
});
