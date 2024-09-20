import '../../styles/global.css';

import type { Metadata } from 'next';

import { Providers } from '@/components/providers';
import NextTopLoader from 'nextjs-toploader';

import { fontSans } from '@/components/fonts';
import { i18n, type Locale } from '@/i18n/config';
import { cn } from '@/utils/cn';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export const metadata: Metadata = {
  title: 'FCF-IAM',
  icons: { icon: '/images/favicon.ico' },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  return (
    <html lang={params.lang} suppressHydrationWarning>
      <body className={cn('min-h-screen font-sans antialiased', fontSans.variable)}>
        <NextTopLoader showSpinner={false} color="hsl(var(--foreground))" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
