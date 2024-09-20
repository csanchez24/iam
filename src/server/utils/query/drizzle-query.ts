/*
 ------
 Goal:
 -----
 The goal with this util it's to standarize the query parameters we use
 to handle READ data not matter the underlying ORM. By standarizing these
 parameters we can write a parser for any ORM to output the correct shape.
 This specific util will take those standard query parameters
 and output a Drizzle-ORM compliant query object.

 NOTE: This is a basic implemetation and does not handle complex cases such
 as filtering from within conditions, column selection and more ...

 TODO: Improve to handle mode use cases as noted above ^
*/

import type { AnyColumn, AnyTable, SQL } from 'drizzle-orm';
import type { TableConfig } from 'drizzle-orm/mysql-core';
import type { CONDITIONAL_OPERATORS, OPERATORS } from './constants';
import type {
  FindManyQuery,
  FindQueryInclude,
  FindQuerySort,
  FindQueryWhere,
  FindUniqueQuery,
} from './types';

import { asc, desc, sql } from 'drizzle-orm';
import { isBooleanOperator } from './utils/is-boolean-operator';
import { isDateOperator } from './utils/is-date-operator';
import { isNumberOperator } from './utils/is-number-operator';
import { isStringOperator } from './utils/is-string-operator';
import { mapOperators } from './utils/map-operators';
import { removeOperators } from './utils/remove-operators';

const MAPPED_DRIZZLE_OPERATORS: Record<(typeof OPERATORS)[number], string> = {
  like: 'LIKE',
  not: 'NOT',
  in: 'IN',
  notIn: 'NOT IN',
  between: 'BETWEEN',
  eq: '=',
  lt: '<',
  lte: '<=',
  gt: '>',
  gte: '>=',
} as const;

const MAPPED_DRIZZLE_CONDITIONAL_OPERATORS: Record<(typeof CONDITIONAL_OPERATORS)[number], string> =
  {
    _and: ' AND ',
    _or: ' OR ',
    _not: ' AND ',
  } as const;

const isWithOrInclude = (v: unknown): v is Record<'with' | 'include', FindQueryInclude> => {
  return !!(
    v &&
    typeof v === 'object' &&
    Object.prototype.toString.call(v) === '[object Object]' &&
    ('with' in v || 'include' in v)
  );
};

const isWhere = (v: unknown): v is Record<'where', FindQueryWhere> => {
  return !!(
    v &&
    typeof v === 'object' &&
    Object.prototype.toString.call(v) === '[object Object]' &&
    'where' in v
  );
};

const getIncludeObj = (v: Record<'with' | 'include', FindQueryInclude>) => {
  return v.with ?? v.include;
};

/**
 * -----------
 * include/with
 * -----------
 * Given the following input return the corresponding output.
 * > input: { company: { address: true }, userType: true }
 * < output: { company: { with: { address: true }}, userType: true }
 */
const getInclude = (
  include: FindManyQuery['include'],
  tableMap: Record<string, AnyTable<TableConfig>>
): FindManyQuery['include'] => {
  if (!include) return;
  return Object.entries(include).reduce((acc, [k, v]) => {
    if (isWithOrInclude(v) && isWhere(v) && tableMap?.[k]) {
      return {
        ...acc,
        [k]: {
          with: getInclude(getIncludeObj(v), tableMap),
          where: sql.join(getWhere(tableMap[k])(v.where)),
        },
      };
    }
    if (isWithOrInclude(v)) {
      return {
        ...acc,
        [k]: {
          with: getInclude(getIncludeObj(v), tableMap),
        },
      };
    }
    if (isWhere(v) && tableMap?.[k]) {
      return {
        ...acc,
        [k]: {
          where: sql.join(getWhere(tableMap[k])(v.where)),
        },
      };
    }
    return { ...acc, [k]: v };
  }, {});
};

/**
 * --------------
 * where
 *--------------
 * Validate input and output drizzle compliant `where` code. For instance we have
 * to convert the following operators `eq` -> `=` and `like` -> `LIKE`.
 * Also provide validation for `_and`, `_or`, `_not` and convert them to their drizzle counterpart `AND`, `OR`, `NOT`.
 *
 * Given the following input return a drizzle compliant output
 * > input: { name: 'John', age: { eq: 5 }, _or: [{ email: { like: 'john'}}]}
 * < output: `name = "John AND age = 5 OR (email LIKE '%john%')"`
 */
const getWhere =
  <TTable>(table: TTable) =>
  (where: NonNullable<FindManyQuery['where']>): SQL[] => {
    return Object.entries(where).reduce((whereQuery, [k, v]) => {
      // Default to '=' + 'AND' condition when using simple query
      // e.g. { firstName: 'John', lastName: 'Doe', isActive: true }
      if (
        typeof v === 'string' ||
        typeof v === 'number' ||
        typeof v === 'boolean' ||
        typeof v === 'bigint' ||
        v === null
      ) {
        whereQuery.push(
          whereQuery.length === 0
            ? sql`${table[k as keyof typeof table]} = ${v}`
            : sql` AND ${table[k as keyof typeof table]} = ${v}`
        );
        return whereQuery;
      }

      // These are props _and, _or and _not with value of an array of itself
      // This section of the query will be constructed like this e.g.:
      // ... or (users.firstName LIKE '%?%') or (users.isActive = ?) ...
      if (Array.isArray(v) && (k === '_and' || k === '_or' || k === '_not')) {
        // Ensure the right operator is added between conditions
        // e.g. firstName = ? AND (users.lastName = ? OR users.email = ?)
        if (whereQuery.length > 0) {
          whereQuery.push(sql.raw(MAPPED_DRIZZLE_CONDITIONAL_OPERATORS[k]));
        }

        // Join SQL array with current operator e.g. AND, OR
        whereQuery.push(
          sql`(${sql.join(
            v.map((w) => getWhere(table)(w)),
            sql.raw(MAPPED_DRIZZLE_CONDITIONAL_OPERATORS[k])
          )})`
        );

        return whereQuery;
      }

      // Replace operators with their drizzle counterpart e.g. 'in' -> 'IN', 'notIn' -> 'NOT IN' ...
      if (
        typeof v === 'object' &&
        Object.prototype.toString.call(v) === '[object Object]' &&
        (isNumberOperator(v) || isStringOperator(v) || isBooleanOperator(v) || isDateOperator(v))
      ) {
        // Check if it's 'LIKE' operator as we need to wrap string in quotes + percentage '%value%'
        if ('like' in v && typeof v.like !== 'undefined') {
          whereQuery.push(sql`${table[k as keyof typeof table]} LIKE '%${sql.raw(v.like)}%'`);
        }
        // Check if it's 'IN' operator as we need to convert from [?, ?, ?] to (?, ?, ?)
        else if ('in' in v && typeof v.in !== 'undefined' && v.in.length > 0) {
          whereQuery.push(
            sql` ${table[k as keyof typeof table]} IN (${sql.join(v.in, sql.raw(','))})`
          );
        }
        // Check if it's 'NOT IN' operator as we need to convert from [?, ?, ?] to (?, ?, ?)
        else if ('notIn' in v && typeof v.notIn !== 'undefined' && v.notIn.length > 0) {
          whereQuery.push(
            sql` ${table[k as keyof typeof table]} NOT IN (${sql.join(v.notIn, sql.raw(','))})`
          );
        }
        // Check if it's 'BETWEEN' operator
        else if ('between' in v && typeof v.between !== 'undefined' && v.between.length === 2) {
          whereQuery.push(
            sql` ${table[k as keyof typeof table]} BETWEEN ${v.between[0]} AND ${v.between[1]}`
          );
        }
        // The remaining operators don't need special convertion
        else {
          const operators = mapOperators(
            removeOperators(v, ['in', 'notIn', 'like', 'between']),
            MAPPED_DRIZZLE_OPERATORS
          );
          Object.entries(operators).forEach(([operator, value]) => {
            whereQuery.push(sql` ${table[k as keyof typeof table]} ${sql.raw(operator)} ${value} `);
          });
        }

        return whereQuery;
      }

      return whereQuery;
    }, [] as SQL[]);
  };

/**
 * --------------
 * sort
 *--------------
 * Output drizzle compliant array of sorting queries
 * > input: { name: 'desc', age: 'asc' }
 * < output: [desc({table}.name), asc({table}.age)]
 */
const getOrderBy =
  <TTable>(table: TTable) =>
  (sortValues: FindQuerySort | undefined) => {
    if (!sortValues) return;
    return Object.entries(sortValues).reduce((sortGroup, [name, dir]) => {
      return sortGroup.concat([
        dir === 'desc'
          ? desc(table[name as keyof typeof table] as AnyColumn)
          : asc(table[name as keyof typeof table] as AnyColumn),
      ]);
    }, [] as SQL[]);
  };

const parseDrizzleFindManyQuery =
  (tablesMap: Record<string, AnyTable<TableConfig>>) =>
  <TTable>(table: TTable) =>
  (q: FindManyQuery) => {
    return {
      with: getInclude(q.include, tablesMap),
      where: q.where ? sql.join(getWhere(table)(q.where)) : undefined,
      orderBy: getOrderBy(table)(q.sort),
    };
  };

const parseDrizzleFindUniqueQuery =
  (tablesMap: Record<string, AnyTable<TableConfig>>) =>
  <TTable>(table: TTable) =>
  (q: FindUniqueQuery | undefined) => {
    return {
      with: q?.include ? getInclude(q.include, tablesMap) : undefined,
      where: q?.where ? sql.join(getWhere(table)(q.where)) : undefined,
    };
  };

export const createDrizzleQueryParsers = (tablesMap: Record<string, AnyTable<TableConfig>>) => ({
  parseDrizzleFindManyQuery: parseDrizzleFindManyQuery(tablesMap),
  parseDrizzleFindUniqueQuery: parseDrizzleFindUniqueQuery(tablesMap),
});
