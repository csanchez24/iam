import type { StringOperators } from '../types';

/** Check operator of type string */
export const isStringOperator = (op: object): op is StringOperators => {
  return Object.entries(op).some(
    ([, v]) =>
      typeof v === 'string' ||
      (Array.isArray(v) && v.some((nv) => typeof nv === 'string')) ||
      v === null
  );
};
