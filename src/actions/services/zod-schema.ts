import { VehicleSize } from 'src/constants/common';

import { uniqBy } from 'lodash';
import { z } from 'zod';

export const priceMatrixSchema = z
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
