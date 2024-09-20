import type { z } from 'zod';
import type {
  BooleanOperatorsSchema,
  DateOperatorsSchema,
  NumberOperatorsSchema,
  SortSchema,
  StringOperatorsSchema,
} from './schemas';

export type NumberOperators = z.infer<typeof NumberOperatorsSchema>;

export type StringOperators = z.infer<typeof StringOperatorsSchema>;

export type BooleanOperators = z.infer<typeof BooleanOperatorsSchema>;

export type DateOperators = z.infer<typeof DateOperatorsSchema>;

export type FindQueryInclude = { [key: string]: FindQueryWhere | FindQueryInclude | boolean };

export type FindQuerySort = Record<string, z.infer<typeof SortSchema>>;

export type FindQueryWhere = {
  [key: string]:
    | string
    | number
    | boolean
    | Date
    | bigint
    | NumberOperators
    | StringOperators
    | BooleanOperators
    | DateOperators
    | FindQueryWhere // for relation refs
    | FindQueryWhere[];
};

export type FindManyQuery = {
  sort?: FindQuerySort;
  where?: FindQueryWhere;
  include?: FindQueryInclude;
};

export type FindUniqueQuery = {
  where?: FindQueryWhere;
  include?: FindQueryInclude;
};
