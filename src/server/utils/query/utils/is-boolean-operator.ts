import type { BooleanOperators } from '../types';

/** Check operator of type boolean */
export const isBooleanOperator = (op: object): op is BooleanOperators => {
  return Object.entries(op).some(([, v]) => typeof v === 'boolean');
};
