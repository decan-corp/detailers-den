import { Role, VehicleSize } from 'src/constants/common';
import { servicesTable } from 'src/schema';

import { createInsertSchema } from 'drizzle-zod';
import { uniqBy } from 'lodash';
import { z } from 'zod';

export const priceMatrixSchema = z
  .array(
    z.object({
      price: z.coerce.number().int().min(0),
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

export const serviceCutMatrixSchema = z
  .array(
    z.object({
      role: z.enum([Role.Crew, Role.StayInCrew, Role.Detailer]),
      cutPercentage: z.coerce.number().int().min(0),
    })
  )
  .refine(
    (value) => {
      const uniqueCutMatrix = uniqBy(value, 'role');
      return uniqueCutMatrix.length === value.length;
    },
    {
      message: 'Roles must be unique',
      path: ['serviceCutMatrix'],
    }
  );

export const serviceSchema = createInsertSchema(servicesTable, {
  serviceName: (schema) => schema.serviceName.min(1),
})
  .merge(
    z.object({
      priceMatrix: priceMatrixSchema,
      serviceCutMatrix: serviceCutMatrixSchema,
    })
  )
  .omit({
    createdBy: true,
    updatedBy: true,
    deletedBy: true,
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
