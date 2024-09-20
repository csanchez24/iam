import type { Application } from '@/server/db/schema';
import type { PaginateReturn } from '@/server/utils/paginate';

import { initContract } from '@ts-rest/core';
import { z } from 'zod';

import {
  ApplicationCreateBodySchema,
  ApplicationFindManyQuerySchema,
  ApplicationFindUniqueSchema,
  ApplicationUpdateBodySchema,
} from '@/schemas/application';

const c = initContract();

export const application = c.router(
  {
    findUnique: {
      method: 'GET',
      path: `/:id`,
      metadata: { isPublic: true } as const,
      pathParams: z.object({ id: z.coerce.number() }),
      query: ApplicationFindUniqueSchema.optional(),
      responses: {
        200: c.type<Application>(),
        400: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    findMany: {
      method: 'GET',
      path: `/`,
      query: ApplicationFindManyQuerySchema,
      responses: {
        200: c.type<PaginateReturn<Application>>(),
        400: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    create: {
      method: 'POST',
      path: `/`,
      body: ApplicationCreateBodySchema,
      responses: {
        201: c.type<Application>(),
        400: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    update: {
      method: 'PUT',
      path: `/:id`,
      pathParams: z.object({ id: z.coerce.number() }),
      body: ApplicationUpdateBodySchema,
      responses: {
        200: c.type<Application>(),
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
        200: c.type<Application>(),
        400: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
  },
  { pathPrefix: '/applications' }
);
