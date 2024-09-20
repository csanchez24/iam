import type { contract } from '@/server/api/contracts';
import type { ClientInferResponseBody, ClientInferRequest } from '@ts-rest/core';
import type { z } from 'zod';
import type { RoleFormSchema } from './@schemas';

export type RolePaginated = ClientInferResponseBody<typeof contract.role.findMany, 200>;

export type Role = ClientInferResponseBody<typeof contract.role.findMany, 200>['data'][number];

export type RoleFormValues = z.infer<typeof RoleFormSchema>;

export type RoleCreateBodyData = ClientInferRequest<typeof contract.role.create>['body']['data'];

export type RoleUpdateBodyData = ClientInferRequest<typeof contract.role.update>['body']['data'];
