import { applications, permissions, roles, users } from '@/server/db/schema';
import { createDrizzleQueryParsers } from '@/server/utils/query';

export const { parseDrizzleFindManyQuery, parseDrizzleFindUniqueQuery } = createDrizzleQueryParsers(
  {
    application: applications,
    applications: applications,
    permission: permissions,
    permissions: permissions,
    role: roles,
    roles: roles,
    user: users,
    users: users,
  }
);
