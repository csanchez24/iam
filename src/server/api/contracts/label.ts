import type { Label } from '@/server/db/schema';
import type { PaginateReturn } from '@/server/utils/paginate';

import { initContract } from '@ts-rest/core';
import { z } from 'zod';

import {
  LabelCreateBodySchema,
  LabelFindManyQuerySchema,
  LabelFindUniqueSchema,
  LabelUpdateBodySchema,
} from '@/schemas/label';

const c = initContract();

export const label = c.router(
  {
    findUnique: {
      method: 'GET',
      path: `/:id`,
      metadata: { isPublic: true } as const,
      pathParams: z.object({ id: z.coerce.number() }),
      query: LabelFindUniqueSchema.optional(),
      responses: {
        200: c.type<Label>(),
        400: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    findMany: {
      method: 'GET',
      path: `/`,
      query: LabelFindManyQuerySchema,
      responses: {
        200: c.type<PaginateReturn<Label>>(),
        400: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    create: {
      method: 'POST',
      path: `/`,
      body: LabelCreateBodySchema,
      responses: {
        201: c.type<Label>(),
        400: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
    update: {
      method: 'PUT',
      path: `/:id`,
      pathParams: z.object({ id: z.coerce.number() }),
      body: LabelUpdateBodySchema,
      responses: {
        200: c.type<Label>(),
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
        200: c.type<Label>(),
        400: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
    },
  },
  { pathPrefix: '/labels' }
);
