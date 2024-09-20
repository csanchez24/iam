import { z } from 'zod';

import {
  NumberOperatorsSchema,
  SortSchema,
  StringOperatorsSchema,
} from '@/server/utils/query/schemas';
import { TransformFalsyStringToNullSchema } from './_common';

const RoleWhereBaseSchema = z.object({
  id: z.union([z.number(), NumberOperatorsSchema]).optional(),
  key: z.union([z.number(), NumberOperatorsSchema]).optional(),
  name: z.union([z.string(), StringOperatorsSchema]).optional(),
  description: z.union([z.string(), StringOperatorsSchema]).optional(),
});

type RoleWhereSchemaType = z.infer<typeof RoleWhereBaseSchema> & {
  _and?: RoleWhereSchemaType[];
  _or?: RoleWhereSchemaType[];
  _not?: RoleWhereSchemaType[];
};

const RoleWhereSchema: z.ZodType<RoleWhereSchemaType> = RoleWhereBaseSchema.extend({
  _and: z.lazy(() => RoleWhereSchema.array().optional()),
  _or: z.lazy(() => RoleWhereSchema.array().optional()),
  _not: z.lazy(() => RoleWhereSchema.array().optional()),
});

const RoleSortSchema = z.object({
  id: SortSchema.optional(),
  key: SortSchema.optional(),
  name: SortSchema.optional(),
  createdAt: SortSchema.optional(),
  updatedAt: SortSchema.optional(),
});

const RoleIncludeSchema = z.object({
  application: z.boolean().optional(),
  usersToRoles: z.boolean().optional(),
  rolesToPermissions: z
    .union([
      z.boolean().optional(),
      z.object({
        with: z.object({
          rolesToPermissions: z.union([
            z.boolean(),
            z.object({
              with: z.object({
                permission: z.boolean(),
              }),
            }),
          ]),
        }),
      }),
    ])
    .optional(),
});

/** Find-many query schema*/
export const RoleFindManyQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  where: RoleWhereSchema.optional(),
  sort: RoleSortSchema.optional(),
  include: RoleIncludeSchema.optional(),
});

/** Find-unique query schema*/
export const RoleFindUniqueSchema = z.object({
  include: RoleIncludeSchema.optional(),
});

/** Create-body query schema*/
export const RoleCreateBodySchema = z.object({
  data: z.object({
    name: z.string().min(1),
    description: TransformFalsyStringToNullSchema,
    applicationId: z.coerce.number(),
    policies: z.object({ permissionId: z.number() }).array().optional(),
  }),
});

/** Update-body query schema*/
export const RoleUpdateBodySchema = z.object({
  data: RoleCreateBodySchema.shape.data.partial(),
});
