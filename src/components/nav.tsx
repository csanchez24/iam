'use client';

import type { Locale } from '@/i18n/config';

import { Icons } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';

import { usePermissions } from '@/hooks/use-permissions';
import { useStoreContext } from '@/store';
import { cn } from '@/utils/cn';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

export const Nav = ({ lang }: { lang: Locale }) => {
  const _pathname = usePathname();

  const [pathname, setPathname] = useState(() => _pathname);

  const dictionary = useStoreContext((state) => state.dictionary.misc.nav);

  const { getPermission } = usePermissions({
    include: ['manage:user', 'manage:application', 'manage:role'],
  });

  const navbarItems = useMemo(
    () => [
      ...(getPermission('read:user').granted
        ? [
            {
              icon: Icons.Users,
              label: dictionary.users,
              href: '/',
              matches: ['/', '/users', `/${lang}/users`],
            },
          ]
        : []),
      ...(getPermission('read:application').granted
        ? [
            {
              icon: Icons.Tasks,
              label: dictionary.applications,
              href: `/${lang}/applications`,
              matches: ['/applications', `/${lang}/applications`],
            },
          ]
        : []),
      ...(getPermission('read:role').granted
        ? [
            {
              icon: Icons.Shield,
              label: dictionary.roles,
              href: `/${lang}/roles`,
              matches: ['/roles', `/${lang}/roles`],
            },
          ]
        : []),
    ],
    [dictionary, lang, getPermission]
  );

  return (
    <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 border-r md:sticky md:block">
      <ScrollArea className="h-full py-4">
        <ul className="flex flex-col items-center space-y-0.5">
          {navbarItems.map(({ icon: Icon, ...nav }) => (
            <li key={nav.label} className="flex w-full justify-center">
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      onClick={() => setPathname(nav.href)}
                      href={nav.href}
                      className={cn(
                        'mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition duration-300 hover:bg-muted-foreground/10',
                        nav.matches.some((match) => match === pathname) &&
                          'bg-muted-foreground/20 hover:bg-muted-foreground/20 [&>*]:text-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{nav.label}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </aside>
  );
};
