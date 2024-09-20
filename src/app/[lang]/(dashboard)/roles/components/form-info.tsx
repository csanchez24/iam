import type { RoleFormValues } from './@types';

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

import { useStoreContext } from '@/store';
import { useFormContext } from 'react-hook-form';

export default function RoleFormInfo() {
  const dictionary = useStoreContext((state) => state.dictionary.roles.form.info);

  const form = useFormContext<RoleFormValues>();

  return (
    <div className="my-6 space-y-2">
      <div>
        <h3 className="text-lg font-medium">{dictionary.heading}</h3>
        <p className="text-sm text-muted-foreground">{dictionary.description}</p>
      </div>
      <Separator />
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
