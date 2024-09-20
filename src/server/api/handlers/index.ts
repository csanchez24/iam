import { contract } from '@/server/api/contracts';
import { createNextHandler } from '@ts-rest/serverless/next';
import { application } from './application';
import { label } from './label';
import { permission } from './permission';
import { role } from './role';
import { user } from './user';

export const handler = createNextHandler(
  contract,
  {
    application,
    label,
    permission,
    role,
    user,
  },
  {
    jsonQuery: true,
    responseValidation: true,
    handlerType: 'app-router',
  }
);
