import type { ApplicationFormValues } from './@types';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useStoreContext } from '@/store';

import { useFormContext } from 'react-hook-form';

export default function ApplicationFormTokens() {
  const dictionary = useStoreContext((state) => state.dictionary.applications.form.tokens);

  const form = useFormContext<ApplicationFormValues>();

  return (
    <div className="my-6 space-y-2">
      <div className="mb-4">
        <h3 className="text-lg font-medium">{dictionary.heading}</h3>
        <p className="text-sm text-muted-foreground">{dictionary.description}</p>
      </div>
      <div>
        <h4 className="font-medium text-muted-foreground">{dictionary.howDoesTokenExpiryWorks}</h4>
        <p className="text-sm text-muted-foreground">
          {dictionary.howDoesTokenExpiryWorksDescription}
        </p>
      </div>
      <Separator />
      <FormField
        name="idTokenExp"
        control={form.control}
        render={({ field: { value, ...field } }) => (
          <FormItem>
            <FormLabel>{dictionary.IdTokenExpiry.label}</FormLabel>
            <FormControl>
              <Input
                placeholder={dictionary.IdTokenExpiry.placeholder}
                value={value ?? ''}
                {...field}
              />
            </FormControl>
            <FormDescription>{dictionary.IdTokenExpiry.description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="accessTokenExp"
        control={form.control}
        render={({ field: { value, ...field } }) => (
          <FormItem>
            <FormLabel>{dictionary.accessTokenExpiry.label}</FormLabel>
            <FormControl>
              <Input
                placeholder={dictionary.accessTokenExpiry.placeholder}
                {...field}
                value={value ?? ''}
              />
            </FormControl>
            <FormDescription>{dictionary.accessTokenExpiry.description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="refreshTokenExp"
        control={form.control}
        render={({ field: { value, ...field } }) => (
          <FormItem>
            <FormLabel>{dictionary.refreshTokenExpiry.label}</FormLabel>
            <FormControl>
              <Input
                placeholder={dictionary.refreshTokenExpiry.placeholder}
                {...field}
                value={value ?? ''}
              />
            </FormControl>
            <FormDescription>{dictionary.refreshTokenExpiry.description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
