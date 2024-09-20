import type { OPERATORS } from '../constants';

/**
 * Remove operators from existing operators object.
 * Given an object with { eq: '=', notIn: 'NOT IN' } we can remove
 * 'eq' and output a new object with just 'notIn' { notIn: 'NOT IN' }
 */
export const removeOperators = (
  operators: Record<
    string,
    | string
    | string[]
    | number
    | number[]
    | boolean
    | Date
    | Date[]
    | [Date | undefined, Date | undefined]
    | null
  >,
  operatorsToBeRemoved: (typeof OPERATORS)[number][]
) => {
  return Object.entries(operators).reduce((acc, [k, v]) => {
    if (operatorsToBeRemoved.includes(k as (typeof OPERATORS)[number])) {
      return acc;
    }
    return { ...acc, [k]: v };
  }, {});
};
