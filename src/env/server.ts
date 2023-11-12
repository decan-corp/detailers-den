import { z } from 'zod';

const serverEnvSchema = z.object({
  DB_HOST: z.string().min(1),
  DB_USERNAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().optional(),
});

export const serverEnv = serverEnvSchema.parse(process.env);
