import { z } from 'zod';

import {
  NumberOperatorsSchema,
  SortSchema,
  StringOperatorsSchema,
} from '@/server/utils/query/schemas';
import { TransformFalsyStringToNullSchema } from './_common';

const PermissionWhereBaseSchema = z.object({
  id: z.union([z.number(), NumberOperatorsSchema]).optional(),
  key: z.union([z.number(), NumberOperatorsSchema]).optional(),
  name: z.union([z.string(), StringOperatorsSchema]).optional(),
  description: z.union([z.string(), StringOperatorsSchema]).optional(),
  applicationId: z.union([z.string(), StringOperatorsSchema]).optional(),
});

type PermissionWhereSchemaType = z.infer<typeof PermissionWhereBaseSchema> & {
  _and?: PermissionWhereSchemaType[];
  _or?: PermissionWhereSchemaType[];
  _not?: PermissionWhereSchemaType[];
};

const PermissionWhereSchema: z.ZodType<PermissionWhereSchemaType> =
  PermissionWhereBaseSchema.extend({
    _and: z.lazy(() => PermissionWhereSchema.array().optional()),
    _or: z.lazy(() => PermissionWhereSchema.array().optional()),
    _not: z.lazy(() => PermissionWhereSchema.array().optional()),
  });

const PermissionSortSchema = z.object({
  id: SortSchema.optional(),
  key: SortSchema.optional(),
  name: SortSchema.optional(),
  applicationId: SortSchema.optional(),
  createdAt: SortSchema.optional(),
  updatedAt: SortSchema.optional(),
});

const PermissionIncludeSchema = z.object({
  application: z.boolean().optional(),
});

/** Find-many query schema*/
export const PermissionFindManyQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  where: PermissionWhereSchema.optional(),
  sort: PermissionSortSchema.optional(),
  include: PermissionIncludeSchema.optional(),
});

/** Find-unique query schema*/
export const PermissionFindUniqueSchema = z.object({
  include: PermissionIncludeSchema.optional(),
});

/** Create-body query schema*/
export const PermissionCreateBodySchema = z.object({
  data: z.object({
    key: z.string().min(1),
    name: z.string().min(1),
    applicationId: z.coerce.number(),
    description: TransformFalsyStringToNullSchema,
  }),
});

/** Update-body query schema*/
export const PermissionUpdateBodySchema = z.object({
  data: PermissionCreateBodySchema.shape.data.partial(),
});
