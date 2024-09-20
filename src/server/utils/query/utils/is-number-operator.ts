import type { NumberOperators } from '../types';

/** Check operator of type number */
export const isNumberOperator = (op: object): op is NumberOperators => {
  return Object.entries(op).some(
    ([, v]) =>
      typeof v === 'number' ||
      typeof v === 'bigint' ||
      (Array.isArray(v) && v.some((nv) => typeof nv === 'number')) ||
      v === null
  );
};
