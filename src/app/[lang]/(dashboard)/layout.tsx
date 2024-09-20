import type { Locale } from '@/i18n/config';

import { Unauthorized } from '@/components/401';
import { Header } from '@/components/header';
import { Nav } from '@/components/nav';
import { StoreProvider } from '@/store';

import { getSession } from '@/auth/libs/server-side-fns';
import { getDictionary } from '@/i18n/get-dictionary';

export default async function DashboardLayout({
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
      <Unauthorized>
        <div className="relative flex min-h-screen flex-col">
          <Header lang={params.lang} />
          <main className="flex-1">
            <div className="border-b">
              <div className="md:grid md:grid-cols-[70px_minmax(0,1fr)]">
                <Nav lang={params.lang} />
                {children}
              </div>
            </div>
          </main>
        </div>
      </Unauthorized>
    </StoreProvider>
  );
}
