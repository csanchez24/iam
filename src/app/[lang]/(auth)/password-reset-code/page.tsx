'use client';

import type { z } from 'zod';

import { AuthPasswordResetCodeBodySchema } from '@/schemas/auth';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import Image from 'next/image';

import { useToast } from '@/components/ui/use-toast';
import { env } from '@/env';
import { useFormErrors } from '@/hooks';
import { useStoreContext } from '@/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

type FormValues = z.infer<typeof AuthPasswordResetCodeBodySchema>;

export default function AuthPasswordResetCodePage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const dictionary = useStoreContext((state) => state.dictionary.auth.passwordResetCode);

  const { toast } = useToast();

  const { onSubmitError } = useFormErrors();

  const form = useForm<FormValues>({
    resolver: zodResolver(AuthPasswordResetCodeBodySchema),
    defaultValues: { code: '' },
  });

  const { mutate: verifyCode, isLoading } = useMutation<
    { success: boolean },
    { message: string },
    FormValues
  >({
    mutationFn: async (values) => {
      const url = new URL('/api/oauth2/password-reset-code', env.NEXT_PUBLIC_API_URL);
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

      return resp.json() as Promise<{ success: boolean }>;
    },
    onSuccess() {
      const url = new URL('/password-reset-confirm', env.NEXT_PUBLIC_APP_URL);
      url.searchParams.set('pass_reset_pid', searchParams.get('pass_reset_pid') ?? '');
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
              {dictionary.description}{' '}
              <span className="font-semibold text-primary">{searchParams.get('email')}</span>
            </p>
          </div>
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => verifyCode(values), onSubmitError)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="mx-auto w-fit">
                      <FormLabel>{dictionary.form.otp.label}</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription>{dictionary.form.otp.description}</FormDescription>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
