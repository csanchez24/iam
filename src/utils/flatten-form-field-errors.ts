import type { FieldErrors, FieldValues } from 'react-hook-form';

export const flattenFormFieldErrors = <T extends FieldValues>(
  errors: FieldErrors<T>,
  parent = ''
): Record<string, string> => {
  return Object.entries(errors).reduce((errors, [field, error]) => {
    // One-level deep
    if (error?.message) {
      return {
        ...errors,
        [parent ? `${parent}.${field}` : field]: error.message,
      };
    }
    // Nested object
    if (Object.prototype.toString.call(error) === '[object Object]') {
      return {
        ...errors,
        ...flattenFormFieldErrors(error as typeof errors, field),
      };
    }
    // Nothing needed
    return errors;
  }, {});
};
