import type { DateOperators } from '../types';

/** Check operator of type date */
export const isDateOperator = (op: object): op is DateOperators => {
  return Object.entries(op).some(
    ([, v]) =>
      v instanceof Date || (Array.isArray(v) && v.some((nv) => nv instanceof Date)) || v === null
  );
};
