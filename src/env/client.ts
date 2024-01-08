import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_VERCEL_URL: z.string().url(), // url generated from vercel deployment
    NEXT_PUBLIC_SITE_URL: z.string().url(), // final url based on configured domain in vercel
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_VERCEL_URL: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
});
