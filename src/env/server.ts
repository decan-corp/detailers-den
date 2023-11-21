import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const serverEnv = createEnv({
  server: {
    DB_HOST: z.string().min(1),
    DB_USERNAME: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().optional(), // used for db connection in local development
    SALT_ROUNDS: z.coerce.number(), // TODO: remove
    NEXTAUTH_URL: z.string().url(), // TODO: remove
    NEXTAUTH_SECRET: z.string().min(1), // TODO: remove
  },
  experimental__runtimeEnv: {},
});
