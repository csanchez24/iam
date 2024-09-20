import { z } from 'zod';

import {
  NumberOperatorsSchema,
  SortSchema,
  StringOperatorsSchema,
} from '@/server/utils/query/schemas';
import { TransformFalsyStringToNullSchema } from './_common';

const LabelWhereBaseSchema = z.object({
  id: z.union([z.number(), NumberOperatorsSchema]).optional(),
  name: z.union([z.string(), StringOperatorsSchema]).optional(),
  description: z.union([z.string(), StringOperatorsSchema]).optional(),
});

type LabelWhereSchemaType = z.infer<typeof LabelWhereBaseSchema> & {
  _and?: LabelWhereSchemaType[];
  _or?: LabelWhereSchemaType[];
  _not?: LabelWhereSchemaType[];
};

const LabelWhereSchema: z.ZodType<LabelWhereSchemaType> = LabelWhereBaseSchema.extend({
  _and: z.lazy(() => LabelWhereSchema.array().optional()),
  _or: z.lazy(() => LabelWhereSchema.array().optional()),
  _not: z.lazy(() => LabelWhereSchema.array().optional()),
});

const LabelSortSchema = z.object({
  id: SortSchema.optional(),
  name: SortSchema.optional(),
  createdAt: SortSchema.optional(),
  updatedAt: SortSchema.optional(),
});

const LabelIncludeSchema = z.object({
  usersToLabels: z.boolean().optional(),
});

/** Find-many query schema*/
export const LabelFindManyQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  where: LabelWhereSchema.optional(),
  sort: LabelSortSchema.optional(),
  include: LabelIncludeSchema.optional(),
});

/** Find-unique query schema*/
export const LabelFindUniqueSchema = z.object({
  include: LabelIncludeSchema.optional(),
});

/** Create-body query schema*/
export const LabelCreateBodySchema = z.object({
  data: z.object({
    name: z.string().min(1),
    description: TransformFalsyStringToNullSchema,
  }),
});

/** Update-body query schema*/
export const LabelUpdateBodySchema = z.object({
  data: LabelCreateBodySchema.shape.data.partial(),
});
