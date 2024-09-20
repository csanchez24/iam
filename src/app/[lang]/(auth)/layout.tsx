import type { Locale } from '@/i18n/config';

import { StoreProvider } from '@/store';

import { getSession } from '@/auth/libs/server-side-fns';
import { getDictionary } from '@/i18n/get-dictionary';

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const session = getSession();
  const dictionary = await getDictionary(params.lang);

  return (
    <StoreProvider session={session} dictionary={dictionary}>
      <main className="relative flex min-h-screen flex-col">
        <div className="flex flex-1 items-center">{children}</div>
      </main>
    </StoreProvider>
  );
}
