/**
 * Map common operators object's keys to ORM counterpart.
 * For instance, a key of name 'like' will become 'contains' in the case of prisma ...
 */
export const mapOperators = (
  fromOperators: Record<
    string,
    string | string[] | number | number[] | boolean | Date | Date[] | null
  >,
  toOperators: Record<string, string>
) => {
  return Object.entries(fromOperators).reduce((acc, [k, v]) => {
    return {
      ...acc,
      [toOperators[k] as unknown as string]: v,
    };
  }, {});
};
