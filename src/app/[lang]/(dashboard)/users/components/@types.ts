import type { LabelCreateBodySchema } from '@/schemas/label';
import type { UserCreateBodySchema } from '@/schemas/user';
import type { contract } from '@/server/api/contracts';
import type { ClientInferResponseBody } from '@ts-rest/core';
import type { z } from 'zod';

export type UserPaginated = ClientInferResponseBody<typeof contract.user.findMany, 200>;

export type User = ClientInferResponseBody<typeof contract.user.findMany, 200>['data'][number];

export type UserFormValues = z.infer<typeof UserCreateBodySchema.shape.data>;

export type Label = ClientInferResponseBody<typeof contract.label.findMany, 200>['data'][number];

export type LabelFormValues = z.infer<typeof LabelCreateBodySchema.shape.data>;
