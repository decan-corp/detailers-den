import { z } from 'zod';

export const paginationSchema = z.object({
  pageSize: z.number().default(10),
  pageIndex: z.number().default(0),
});

const sortFieldSchema = z.object({
  id: z.string().min(1),
  desc: z.boolean(),
});

export const sortingSchema = z.object({
  sortBy: z.union([z.array(sortFieldSchema), sortFieldSchema]).optional(),
});
