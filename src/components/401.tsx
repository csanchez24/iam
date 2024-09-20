'use client';

import { useStoreContext } from '@/store';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { plural } from 'pluralize';

export function Unauthorized({ children }: { children: React.ReactNode }) {
  const session = useStoreContext((state) => state.session);
  const router = useRouter();
  const pathname = usePathname();

  const isActive = session?.user?.is_active;

  const hasPermissions = !!session?.permissions.length;

  const isPermitted = session?.permissions.some((permission) => {
    const resource = permission.split(':').at(-1);
    return !resource ? false : pathname.includes(plural(resource));
  });

  /* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */
  const isAdmin = session?.user?.is_admin || session?.user?.is_super_admin;

  React.useEffect(() => {
    if (isActive && isAdmin) {
      return;
    }
    if (!(isActive && hasPermissions)) {
      router.push('/401');
    } else if (!(isActive && isPermitted)) {
      router.push(`/unauthorized`);
    }
  }, [isActive, isAdmin, isPermitted, hasPermissions, router]);

  return <>{children}</>;
}
