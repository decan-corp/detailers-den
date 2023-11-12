import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema.ts',
  out: './drizzle/',
  driver: 'mysql2',
} satisfies Config;
