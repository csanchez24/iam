import { z } from 'zod';

import {
  NumberOperatorsSchema,
  SortSchema,
  StringOperatorsSchema,
} from '@/server/utils/query/schemas';
import { TransformFalsyStringToNullSchema } from './_common';
import { PermissionCreateBodySchema } from './permission';

const ApplicationWhereBaseSchema = z.object({
  id: z.union([z.number(), NumberOperatorsSchema]).optional(),
  key: z.union([z.string(), StringOperatorsSchema]).optional(),
  name: z.union([z.string(), StringOperatorsSchema]).optional(),
  description: z.union([z.string(), StringOperatorsSchema]).optional(),
  domain: z.union([z.string(), StringOperatorsSchema]).optional(),
  clientId: z.union([z.string(), StringOperatorsSchema]).optional(),
  secretId: z.union([z.string(), StringOperatorsSchema]).optional(),
  homeUrl: z.union([z.string(), StringOperatorsSchema]).optional(),
});

type ApplicationWhereSchemaType = z.infer<typeof ApplicationWhereBaseSchema> & {
  _and?: ApplicationWhereSchemaType[];
  _or?: ApplicationWhereSchemaType[];
  _not?: ApplicationWhereSchemaType[];
};

const ApplicationWhereSchema: z.ZodType<ApplicationWhereSchemaType> =
  ApplicationWhereBaseSchema.extend({
    _and: z.lazy(() => ApplicationWhereSchema.array().optional()),
    _or: z.lazy(() => ApplicationWhereSchema.array().optional()),
    _not: z.lazy(() => ApplicationWhereSchema.array().optional()),
  });

const ApplicationSortSchema = z.object({
  id: SortSchema.optional(),
  key: SortSchema.optional(),
  name: SortSchema.optional(),
  domain: SortSchema.optional(),
  createdAt: SortSchema.optional(),
  updatedAt: SortSchema.optional(),
});

const ApplicationIncludeSchema = z.object({
  permissions: z.boolean().optional(),
});

/** Find-many query schema*/
export const ApplicationFindManyQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  where: ApplicationWhereSchema.optional(),
  sort: ApplicationSortSchema.optional(),
  include: ApplicationIncludeSchema.optional(),
});

/** Find-unique query schema*/
export const ApplicationFindUniqueSchema = z.object({
  include: ApplicationIncludeSchema.optional(),
});

/** Create-body query schema*/
export const ApplicationCreateBodySchema = z.object({
  data: z.object({
    name: z.string(),
    clientId: z.string().optional(),
    secretId: z.string().optional(),
    domain: z.string().min(1).url(),
    homeUrl: z.string().min(1).url(),
    loginUrl: z.string().min(1).url(),
    logoutUrl: z.string().min(1).url(),
    callbackUrl: z.string().min(1).url(),
    idTokenExp: z.coerce.number(),
    accessTokenExp: z.coerce.number(),
    refreshTokenExp: z.coerce.number(),
    description: TransformFalsyStringToNullSchema,
    permissions: PermissionCreateBodySchema.shape.data
      .omit({ applicationId: true })
      .array()
      .optional(),
  }),
});

/** Update-body query schema*/
export const ApplicationUpdateBodySchema = z.object({
  data: ApplicationCreateBodySchema.shape.data.partial(),
});
