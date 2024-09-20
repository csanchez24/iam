'use client';

import type { FieldValues, SubmitErrorHandler } from 'react-hook-form';

import { flattenFormFieldErrors } from '@/utils/flatten-form-field-errors';
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function useFormErrors<T extends FieldValues>() {
  const { toast } = useToast();

  const onSubmitError: SubmitErrorHandler<T> = useCallback(
    (fieldErrors) => {
      const errors = Object.entries(flattenFormFieldErrors(fieldErrors));
      toast({
        variant: 'destructive',
        title: `Address the following ${Object.keys(errors).length} issues and try again.`,
        description: (
          <ul className="mt-2 w-fit space-y-1 rounded-md">
            {errors.map(([field, error]) => (
              <li key={field + error} className="text-destructive-foreground">
                • {field}: {error}
              </li>
            ))}
          </ul>
        ),
      });
    },
    [toast]
  );

  return { onSubmitError };
}
