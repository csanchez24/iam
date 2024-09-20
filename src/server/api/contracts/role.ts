import type { Role } from '@/server/db/schema';
import type { PaginateReturn } from '@/server/utils/paginate';

import { initContract } from '@ts-rest/core';
import { z } from 'zod';

import {
  RoleCreateBodySchema,
  RoleFindManyQuerySchema,
  RoleFindUniqueSchema,
  RoleUpdateBodySchema,
} from '@/schemas/role';

const c = initContract();

export const role = c.router(
  {
    findUnique: {
      method: 'GET',
      path: `/:id`,
      metadata: { isPublic: true } as const,
      pathParams: z.object({ id: z.coerce.number() }),
      query: RoleFindUniqueSchema.optional(),
      responses: {
        200: c.type<Role>(),
        400: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    findMany: {
      method: 'GET',
      path: `/`,
      query: RoleFindManyQuerySchema,
      responses: {
        200: c.type<PaginateReturn<Role>>(),
        400: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    create: {
      method: 'POST',
      path: `/`,
      body: RoleCreateBodySchema,
      responses: {
        201: c.type<Role>(),
        400: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    update: {
      method: 'PUT',
      path: `/:id`,
      pathParams: z.object({ id: z.coerce.number() }),
      body: RoleUpdateBodySchema,
      responses: {
        200: c.type<Role>(),
        400: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    delete: {
      method: 'DELETE',
      path: `/:id`,
      pathParams: z.object({ id: z.coerce.number() }),
      body: null,
      responses: {
        200: c.type<Role>(),
        400: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
  },
  { pathPrefix: '/roles' }
);
