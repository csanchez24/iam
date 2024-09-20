import type { Label, LabelFormValues } from './@types';

import { LabelCreateBodySchema } from '@/schemas/label';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import * as React from 'react';

import { useFormErrors } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useCreateLabel } from '../hooks/use-create-label';
import { useUpdateLabel } from '../hooks/use-update-label';
import { useStoreContext } from '@/store';

/**
 * This is the form that gets triggered when clicking the `add more` button under the
 * labels select dropdown found in the form-info component. I moved it out
 * here as the goal is to trigger it from within the root component instead of the
 * form-info component in order to avoid nesting form within form.
 */
export function UsersLabelsForm({
  label,
  onSucces,
  onError,
  onCancel,
}: {
  label?: Label;
  onSucces?(): void;
  onError?(): void;
  onCancel?(): void;
}) {
  const dictionary = useStoreContext((state) => state.dictionary.users.form.label);

  const { onSubmitError } = useFormErrors();

  const form = useForm<LabelFormValues>({
    resolver: zodResolver(LabelCreateBodySchema.shape.data),
    values: React.useMemo(() => {
      return {
        name: label?.name ?? '',
        description: label?.description ?? '',
      };
    }, [label]),
  });

  const { mutateAsync: create, isLoading: isCreatingLabel } = useCreateLabel({
    onSuccess: () => {
      form.reset();
      onSucces?.();
    },
  });

  const { mutateAsync: update, isLoading: isUpadingLabel } = useUpdateLabel({
    onSuccess: () => {
      form.reset();
      onSucces?.();
    },
    onError: () => {
      onError?.();
    },
  });

  const isLoading = React.useMemo(
    () => isCreatingLabel || isUpadingLabel,
    [isCreatingLabel, isUpadingLabel]
  );

  const isUpdate = React.useMemo(() => !!label, [label]);

  const onSubmit = React.useCallback(
    async (data: LabelFormValues) => {
      if (label && isUpdate) {
        await update({ params: { id: label.id }, body: { data } });
      } else {
        await create({ body: { data } });
      }
    },
    [label, create, update, isUpdate]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onSubmitError)} className="space-y-4">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.name.label}</FormLabel>
              <FormControl>
                <Input placeholder={dictionary.name.placeholder} {...field} />
              </FormControl>
              <FormDescription>{dictionary.name.description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="description"
          control={form.control}
          render={({ field: { value, ...field } }) => (
            <FormItem>
              <FormLabel>{dictionary.desc.label}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={dictionary.desc.placeholder}
                  value={value ?? ''}
                />
              </FormControl>
              <FormDescription>{dictionary.desc.description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            className="min-w-24"
            onClick={() => {
              form.reset();
              onCancel?.();
            }}
          >
            {dictionary.buttons.cancel}
          </Button>
          <Button type="submit" className="min-w-24">
            {isLoading && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
            {dictionary.buttons.save}
          </Button>
        </div>
      </form>
    </Form>
  );
}
