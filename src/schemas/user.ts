import { z } from 'zod';

import {
  BooleanOperatorsSchema,
  NumberOperatorsSchema,
  SortSchema,
  StringOperatorsSchema,
} from '@/server/utils/query/schemas';
import { TransformFalsyStringToNullSchema } from './_common';

const UserWhereBaseSchema = z.object({
  id: z.union([z.number(), NumberOperatorsSchema]).optional(),
  firstName: z.union([z.string(), StringOperatorsSchema]).optional(),
  lastName: z.union([z.string(), StringOperatorsSchema]).optional(),
  middleName: z.union([z.string(), StringOperatorsSchema]).optional(),
  email: z.union([z.string(), StringOperatorsSchema]).optional(),
  phone: z.union([z.string(), StringOperatorsSchema]).optional(),
  isActive: z.union([z.boolean(), BooleanOperatorsSchema]).optional(),
  isAdmin: z.union([z.boolean(), BooleanOperatorsSchema]).optional(),
  isSuperAdmin: z.union([z.boolean(), BooleanOperatorsSchema]).optional(),
});

type UserWhereSchemaType = z.infer<typeof UserWhereBaseSchema> & {
  _and?: UserWhereSchemaType[];
  _or?: UserWhereSchemaType[];
  _not?: UserWhereSchemaType[];
};

const UserWhereSchema: z.ZodType<UserWhereSchemaType> = UserWhereBaseSchema.extend({
  _and: z.lazy(() => UserWhereSchema.array().optional()),
  _or: z.lazy(() => UserWhereSchema.array().optional()),
  _not: z.lazy(() => UserWhereSchema.array().optional()),
});

const UserSortSchema = z.object({
  id: SortSchema.optional(),
  firstName: SortSchema.optional(),
  lastName: SortSchema.optional(),
  middleName: SortSchema.optional(),
  email: SortSchema.optional(),
  phone: SortSchema.optional(),
  isActive: SortSchema.optional(),
  isAdmin: SortSchema.optional(),
  isSuperAdmin: SortSchema.optional(),
  createdAt: SortSchema.optional(),
  updatedAt: SortSchema.optional(),
});

const UserIncludeSchema = z.object({
  usersToRoles: z.boolean().optional(),
  usersToLabels: z.boolean().optional(),
});

/** Find-many query schema*/
export const UserFindManyQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  where: UserWhereSchema.optional(),
  sort: UserSortSchema.optional(),
  include: UserIncludeSchema.optional(),
});

/** Find-unique query schema*/
export const UserFindUniqueSchema = z.object({
  include: UserIncludeSchema.optional(),
});

/** Create-body query schema*/
export const UserCreateBodySchema = z.object({
  data: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().min(1),
    password: z.string().min(6),
    isActive: z.boolean().default(true).optional(),
    isAdmin: z.boolean().default(false).optional(),
    isSuperAdmin: z.boolean().default(false).optional(),
    middleName: TransformFalsyStringToNullSchema,
    phone: TransformFalsyStringToNullSchema,
    roles: z.object({ roleId: z.number() }).array().optional(),
    labels: z.object({ labelId: z.number() }).array().optional(),
  }),
});

/** Update-body query schema*/
export const UserUpdateBodySchema = z.object({
  data: UserCreateBodySchema.shape.data
    .omit({ password: true })
    .extend({
      password: z
        .string()
        .refine((v) => {
          return v === '' || v.length >= 6;
        })
        .optional(),
    })
    .partial(),
});
