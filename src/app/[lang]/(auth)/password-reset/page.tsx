'use client';

import type { z } from 'zod';

import { AuthPasswordResetBodySchema } from '@/schemas/auth';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';

import { useToast } from '@/components/ui/use-toast';
import { env } from '@/env';
import { useFormErrors } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useStoreContext } from '@/store';

type FormValues = z.infer<typeof AuthPasswordResetBodySchema>;

export default function AuthPasswordResetPage() {
  const router = useRouter();

  const dictionary = useStoreContext((state) => state.dictionary.auth.passwordReset);

  const { onSubmitError } = useFormErrors();

  const { toast } = useToast();

  const searchParams = useSearchParams();

  const form = useForm<FormValues>({
    resolver: zodResolver(AuthPasswordResetBodySchema),
    defaultValues: { email: '' },
  });

  const { mutate: resetPassword, isLoading } = useMutation<
    { passResetPid: string },
    { message: string },
    FormValues
  >({
    mutationFn: async (values) => {
      const url = new URL('/api/oauth2/password-reset', env.NEXT_PUBLIC_API_URL);
      url.searchParams.set('auth_req_pid', searchParams.get('pid') ?? '');
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (resp.status >= 400) {
        const data = (await resp.json()) as { message: string };
        throw new Error(data?.message ?? 'Some unhandled issue took place.');
      }

      return resp.json() as Promise<{ passResetPid: string }>;
    },
    onSuccess(data, variables) {
      const url = new URL('/password-reset-code', env.NEXT_PUBLIC_APP_URL);
      url.searchParams.set('pass_reset_pid', data.passResetPid);
      url.searchParams.set('email', variables.email);
      router.replace(url.toString());
    },
    onError: (error) => {
      toast({ variant: 'destructive', description: error.message });
    },
  });

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Card className="max-w-lg">
        <CardContent className="space-y-8 p-12">
          <div className="flex flex-col items-center space-y-4">
            <Image
              src="/images/confenalco-logo.png"
              priority={true}
              alt="Logo"
              width={130}
              height={106}
              style={{ height: 106, width: 130 }}
            />
            <h1>{dictionary.heading}</h1>
            <p className="mx-auto w-10/12 text-center leading-tight text-muted-foreground">
              {dictionary.description}
            </p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => resetPassword(values), onSubmitError)}
              className="space-y-6"
            >
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder={dictionary.form.email.placeholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isLoading} className="w-full">
                {isLoading && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                {dictionary.form.buttons.continue}
              </Button>
            </form>
          </Form>

          <Link
            href={`/login?pid=${searchParams.get('pid')}`}
            className="inline-block underline underline-offset-2"
          >
            {dictionary.form.backToLogin}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
