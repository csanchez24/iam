'use client';

import type { z } from 'zod';

import { AuthPasswordResetConfirmBodySchema } from '@/schemas/auth';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import * as React from 'react';

import { useToast } from '@/components/ui/use-toast';
import { env } from '@/env';
import { useFormErrors } from '@/hooks';
import { useStoreContext } from '@/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

type FormValues = z.infer<typeof AuthPasswordResetConfirmBodySchema>;

export default function AuthPasswordResetConfirmPage() {
  const router = useRouter();

  const dictionary = useStoreContext((state) => state.dictionary.auth.passwordResetConfirm);

  const { toast } = useToast();

  const { onSubmitError } = useFormErrors();

  const [visiblePassword, setVisiblePassword] = React.useState(false);

  const [visiblePasswordConfirmation, setVisiblePasswordConfirmation] = React.useState(false);

  const searchParams = useSearchParams();

  const form = useForm<FormValues>({
    resolver: zodResolver(AuthPasswordResetConfirmBodySchema),
    defaultValues: { password: '', passwordConfirmation: '' },
  });

  const { mutate: resetPassword, isLoading } = useMutation<
    { authReqPid: string },
    { message: string },
    FormValues
  >({
    mutationFn: async (values) => {
      const url = new URL('/api/oauth2/password-reset-confirm', env.NEXT_PUBLIC_API_URL);
      url.searchParams.set('pass_reset_pid', searchParams.get('pass_reset_pid') ?? '');
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (resp.status >= 400) {
        const data = (await resp.json()) as { message: string };
        throw new Error(data?.message ?? 'Some unhandled issue took place.');
      }

      return resp.json() as Promise<{ authReqPid: string }>;
    },
    onSuccess(data) {
      const url = new URL('/login', env.NEXT_PUBLIC_APP_URL);
      url.searchParams.set('pid', data.authReqPid);
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
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.form.password.label}</FormLabel>
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
              <FormField
                name="passwordConfirmation"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.form.confirmNewPassword.label}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder={dictionary.form.confirmNewPassword.placeholder}
                          type={visiblePasswordConfirmation ? 'text' : 'password'}
                          {...field}
                        />
                        {field.value && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 h-8 w-8  -translate-y-1/2 transform"
                            onClick={() => {
                              setVisiblePasswordConfirmation((visible) => !visible);
                            }}
                          >
                            {visiblePasswordConfirmation ? (
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
        </CardContent>
      </Card>
    </div>
  );
}
