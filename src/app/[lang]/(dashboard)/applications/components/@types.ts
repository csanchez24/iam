import type { ApplicationCreateBodySchema } from '@/schemas/application';
import type { contract } from '@/server/api/contracts';
import type { ClientInferResponseBody } from '@ts-rest/core';
import type { z } from 'zod';

export type ApplicationPaginated = ClientInferResponseBody<
  typeof contract.application.findMany,
  200
>;

export type Application = ClientInferResponseBody<
  typeof contract.application.findMany,
  200
>['data'][number];

export type ApplicationFormValues = z.infer<typeof ApplicationCreateBodySchema.shape.data>;
