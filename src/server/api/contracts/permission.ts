import type { Permission } from '@/server/db/schema';
import type { PaginateReturn } from '@/server/utils/paginate';

import { initContract } from '@ts-rest/core';
import { z } from 'zod';

import {
  PermissionCreateBodySchema,
  PermissionFindManyQuerySchema,
  PermissionFindUniqueSchema,
  PermissionUpdateBodySchema,
} from '@/schemas/permission';

const c = initContract();

export const permission = c.router(
  {
    findUnique: {
      method: 'GET',
      path: `/:id`,
      metadata: { isPublic: true } as const,
      pathParams: z.object({ id: z.coerce.number() }),
      query: PermissionFindUniqueSchema.optional(),
      responses: {
        200: c.type<Permission>(),
        400: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    findMany: {
      method: 'GET',
      path: `/`,
      query: PermissionFindManyQuerySchema,
      responses: {
        200: c.type<PaginateReturn<Permission>>(),
        400: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    create: {
      method: 'POST',
      path: `/`,
      body: PermissionCreateBodySchema,
      responses: {
        201: c.type<Permission>(),
        400: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    update: {
      method: 'PUT',
      path: `/:id`,
      pathParams: z.object({ id: z.coerce.number() }),
      body: PermissionUpdateBodySchema,
      responses: {
        200: c.type<Permission>(),
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
        200: c.type<Permission>(),
        400: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
  },
  { pathPrefix: '/permissions' }
);
