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

export default function ApplicationFormUrls() {
  const dictionary = useStoreContext((state) => state.dictionary.applications.form.callbackUrls);

  const form = useFormContext<ApplicationFormValues>();

  return (
    <div className="my-6 space-y-2">
      <div>
        <h3 className="text-lg font-medium">{dictionary.heading}</h3>
        <p className="text-sm text-muted-foreground">{dictionary.description}</p>
      </div>
      <Separator />
      <FormField
        name="homeUrl"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{dictionary.applicationHomepageURI.label}</FormLabel>
            <FormControl>
              <Input placeholder={dictionary.applicationHomepageURI.placeholder} {...field} />
            </FormControl>
            <FormDescription>{dictionary.applicationHomepageURI.description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="loginUrl"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{dictionary.applicationLoginURI.label}</FormLabel>
            <FormControl>
              <Input placeholder={dictionary.applicationLoginURI.placeholder} {...field} />
            </FormControl>
            <FormDescription>{dictionary.applicationLoginURI.description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="callbackUrl"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{dictionary.allowedCallbackURL.label}</FormLabel>
            <FormControl>
              <Input placeholder={dictionary.allowedCallbackURL.placeholder} {...field} />
            </FormControl>
            <FormDescription>{dictionary.allowedCallbackURL.description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="logoutUrl"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{dictionary.allowedLogoutRedirectURLs.label}</FormLabel>
            <FormControl>
              <Input placeholder={dictionary.allowedLogoutRedirectURLs.placeholder} {...field} />
            </FormControl>
            <FormDescription>{dictionary.allowedLogoutRedirectURLs.description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
