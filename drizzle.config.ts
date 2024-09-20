import type { Config } from 'drizzle-kit';
import { env } from '@/env';

export default {
  dialect: 'mysql',
  schema: './src/server/db/schema.ts',
  out: './src/server/db/migrations',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  introspect: {
    casing: 'camel',
  },
} satisfies Config;
