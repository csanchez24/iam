import { z } from 'zod';

export const NumberOperatorsSchema = z.object({
  eq: z.number().nullish(),
  not: z.number().nullish(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
});

export const StringOperatorsSchema = z
  .object({
    eq: z.string().nullish(),
    not: z.string().nullish(),
    like: z.string().optional(),
    in: z.string().array().optional(),
    notIn: z.string().array().optional(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
  })
  .strict();

export const BooleanOperatorsSchema = z.object({
  eq: z.boolean().nullish(),
  not: z.boolean().nullish(),
});

export const DateOperatorsSchema = z.object({
  eq: z.coerce.date().nullish(),
  not: z.coerce.date().nullish(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  between: z.tuple([z.coerce.date(), z.coerce.date()]).optional(),
});

export const SortSchema = z.enum(['asc', 'desc']);
