'use client';

import type { z } from 'zod';

import { AuthLoginBodySchema } from '@/schemas/auth';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { useToast } from '@/components/ui/use-toast';
import { env } from '@/env';
import { useFormErrors } from '@/hooks';
import { useStoreContext } from '@/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

type FormValues = z.infer<typeof AuthLoginBodySchema>;

export default function AuthLoginPage() {
  const dictionary = useStoreContext((state) => state.dictionary.auth.login);

  const router = useRouter();

  const { onSubmitError } = useFormErrors();

  const { toast } = useToast();

  const [visiblePassword, setVisiblePassword] = React.useState(false);

  const searchParams = useSearchParams();

  const form = useForm<FormValues>({
    resolver: zodResolver(AuthLoginBodySchema),
    defaultValues: { email: '', password: '' },
  });

  const { mutate: login, isLoading } = useMutation<
    { code: string; state: string; redirectUrl: string },
    { message: string },
    FormValues
  >({
    mutationFn: async (values) => {
      const pid = searchParams.get('pid');
      const url = new URL('/api/oauth2/login', env.NEXT_PUBLIC_API_URL);
      url.searchParams.set('pid', pid ?? '');
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (resp.status >= 400) {
        const data = (await resp.json()) as { message: string };
        throw new Error(data?.message ?? 'Some unhandled issue took place.');
      }

      return resp.json() as Promise<{ code: string; state: string; redirectUrl: string }>;
    },
    onSuccess: (data) => {
      const url = new URL(data.redirectUrl);
      url.searchParams.set('code', data.code);
      url.searchParams.set('state', data.state);
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
            <p className="mx-auto w-8/12 text-center leading-tight text-muted-foreground">
              {dictionary.description}
            </p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => login(values), onSubmitError)}
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
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder={dictionary.form.password.placeholder}
                          type={visiblePassword ? 'text' : 'password'}
                          {...field}
                        />
                        {field.value && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 h-8 w-8  -translate-y-1/2 transform"
                            onClick={() => {
                              setVisiblePassword((visible) => !visible);
                            }}
                          >
                            {visiblePassword ? (
                              <Icons.EyeNone className="h-4 w-4" />
                            ) : (
                              <Icons.EyeOpen className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
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
            href={`/password-reset?pid=${searchParams.get('pid') ?? ''}`}
            className="inline-block underline underline-offset-2"
          >
            {dictionary.form.forgotPassword}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
