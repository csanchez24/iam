'use client';

import type { Locale } from '@/i18n/config';

import { Icons } from '@/components/icons';
import { Nav } from '@/components/nav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { useToast } from '@/components/ui/use-toast';
import { env } from '@/env';
import { useStoreContext, type State } from '@/store';
import { useMutation } from '@tanstack/react-query';
import { useTheme } from 'next-themes';

export function Header({ lang }: { lang: Locale }) {
  const session = useStoreContext((state) => state.session);

  return (
    <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center px-4 md:px-8">
        <MainNav lang={lang} />
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="flex items-center space-x-4">
            <UserDropdownMenu session={session} />

            <span className="border-l pl-2">
              <ModeToggle />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function MainNav({ lang }: { lang: Locale }) {
  const [openMenuSheet, setOpenMenuSheet] = React.useState(false);

  return (
    <div className="mr-4 flex">
      {/* Menu burger */}
      <Button
        variant="secondary"
        size="sm"
        className="mr-3 flex w-fit justify-start p-1.5 md:hidden"
        onClick={() => setOpenMenuSheet(!openMenuSheet)}
      >
        <Icons.Menu className="h-6 w-6" />
      </Button>

      {/* Logo */}
      <Link href="/" className="-ml-3 flex items-center space-x-2">
        <Image
          src="/images/confenalco-logo.png"
          priority={true}
          alt="Logo"
          width={40}
          height={34}
          style={{ height: 34, width: 40 }}
        />
        <span className="inline-block text-lg font-semibold">IAM</span>
      </Link>

      {/* Menu sheet */}
      <Sheet open={openMenuSheet} onOpenChange={setOpenMenuSheet}>
        <SheetContent className="m-0 p-0 sm:max-w-lg" side="left">
          <Nav lang={lang} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ModeToggle() {
  const dictionary = useStoreContext((state) => state.dictionary.misc);

  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-9 px-0">
          <Icons.Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Icons.Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Icons.Sun className="mr-2 h-4 w-4" />
          <span>{dictionary.themeToggle.values.light}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Icons.Moon className="mr-2 h-4 w-4" />
          <span>{dictionary.themeToggle.values.dark}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Icons.Laptop className="mr-2 h-4 w-4" />
          <span>{dictionary.themeToggle.values.system}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserDropdownMenu({ session }: { session: State['session'] }) {
  const dictionary = useStoreContext((state) => state.dictionary.misc);

  const { toast } = useToast();

  const { mutate: logout, isLoading } = useMutation<
    { success: boolean },
    { message: string; status: number }
  >({
    mutationFn: async () => {
      const url = new URL('/api/auth/logout', env.NEXT_PUBLIC_API_URL);
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (resp.status >= 400) {
        const data = (await resp.json()) as { message: string };
        throw new Error(data?.message ?? 'Some unhandled issue took place.');
      }

      return resp.json() as Promise<{ success: true }>;
    },
    onSuccess: () => {
      window.location.replace(env.NEXT_PUBLIC_APP_URL);
    },
    onError: (error) => {
      toast({ variant: 'destructive', description: error.message });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/70 text-secondary">
              {session?.user?.given_name?.slice(0, 2).toUpperCase() ?? ''}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={isLoading} onClick={() => logout()}>
          {dictionary.settings.dropdown.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
