import { env } from '@/env';
import { contract } from '@/server/api/contracts';
import { createTsRestNextClient } from '@/utils/create-ts-rest-client';

export const api = createTsRestNextClient(contract, {
  baseUrl: env.NEXT_PUBLIC_API_URL,
});
