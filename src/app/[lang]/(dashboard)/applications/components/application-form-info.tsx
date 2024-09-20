import { Icons } from '@/components/icons';
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
import { Textarea } from '@/components/ui/textarea';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { useStoreContext } from '@/store';
import { useFormContext } from 'react-hook-form';

export default function ApplicationFormInfo() {
  const dictionary = useStoreContext((state) => state.dictionary.applications.form.info);

  const form = useFormContext<ApplicationFormValues>();

  const [copiedSecret, setCopiedSecret] = React.useState(false);

  return (
    <div className="my-6 space-y-2">
      <div>
        <h3 className="text-lg font-medium">Primary information</h3>
        <p className="text-sm text-muted-foreground">
          This section includes the main fields required to create a new application.
        </p>
      </div>
      <Separator />
      <FormField
        name="clientId"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{dictionary.clientId.label}</FormLabel>
            <FormControl>
              <Input placeholder={dictionary.clientId.placeholder} disabled {...field} />
            </FormControl>
            <FormDescription>{dictionary.clientId.description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="secretId"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{dictionary.secretId.label}</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  placeholder={dictionary.secretId.placeholder}
                  type="password"
                  disabled
                  {...field}
                />
                {field.value && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 h-8 w-8  -translate-y-1/2 transform"
                    onClick={() => {
                      setCopiedSecret((copied) => !copied);
                      navigator.clipboard.writeText(field.value ?? '');
                    }}
                  >
                    {copiedSecret ? (
                      <Icons.CopyDone className="h-4 w-4" />
                    ) : (
                      <Icons.Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </FormControl>
            <FormDescription>{dictionary.secretId.description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
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
        name="domain"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{dictionary.domain.label}</FormLabel>
            <FormControl>
              <Input placeholder={dictionary.domain.placeholder} {...field} />
            </FormControl>
            <FormDescription>{dictionary.domain.description}</FormDescription>
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
              <Textarea placeholder={dictionary.desc.placeholder} {...field} value={value ?? ''} />
            </FormControl>
            <FormDescription>{dictionary.desc.description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
