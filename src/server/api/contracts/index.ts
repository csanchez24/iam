import { initContract } from '@ts-rest/core';
import { application } from './application';
import { label } from './label';
import { permission } from './permission';
import { role } from './role';
import { user } from './user';

const c = initContract();

export const contract = c.router(
  {
    application,
    label,
    permission,
    role,
    user,
  },
  {
    pathPrefix: '/api/v1',
  }
);
