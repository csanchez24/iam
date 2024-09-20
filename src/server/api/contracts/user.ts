import type { User } from '@/server/db/schema';
import type { PaginateReturn } from '@/server/utils/paginate';

import { initContract } from '@ts-rest/core';
import { z } from 'zod';

import {
  UserCreateBodySchema,
  UserFindManyQuerySchema,
  UserFindUniqueSchema,
  UserUpdateBodySchema,
} from '@/schemas/user';

const c = initContract();

export const user = c.router(
  {
    findUnique: {
      method: 'GET',
      path: `/:id`,
      metadata: { isPublic: true } as const,
      pathParams: z.object({ id: z.coerce.number() }),
      query: UserFindUniqueSchema.optional(),
      responses: {
        200: c.type<User>(),
        400: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    findMany: {
      method: 'GET',
      path: `/`,
      query: UserFindManyQuerySchema,
      responses: {
        200: c.type<PaginateReturn<User>>(),
        400: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    create: {
      method: 'POST',
      path: `/`,
      body: UserCreateBodySchema,
      responses: {
        201: c.type<User>(),
        400: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    update: {
      method: 'PUT',
      path: `/:id`,
      pathParams: z.object({ id: z.coerce.number() }),
      body: UserUpdateBodySchema,
      responses: {
        200: c.type<User>(),
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
        200: c.type<User>(),
        400: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
  },
  { pathPrefix: '/users' }
);
