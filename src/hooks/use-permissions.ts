import { useStoreContext } from '@/store';
import * as React from 'react';

/** Expose fns to ease interation with permissions list in store */
export const usePermissions = (options?: { include?: string[] }) => {
  const user = useStoreContext((state) => state.session?.user);
  const permissions = useStoreContext((state) => state.session?.permissions);

  const getPermission = React.useCallback(
    (permission: string | string[]) => {
      // Given a list of e.g. input -> ['create:user', 'manage:user', 'create:application']
      // it will consolidate all actions and resources into a single string separated by commas
      // getting rid of duplicates e.g. output -> ['create,manage', 'user,application']
      const [action, resource] = [
        ...(typeof permission === 'string' ? [permission] : permission),
        ...(options?.include ?? []),
      ]
        .reduce(
          (acc, cur) => {
            const [a, r] = cur.split(':');
            acc[0] = Array.from(new Set([...(acc[0] as unknown as string[]), a ?? '']));
            acc[1] = Array.from(new Set([...(acc[1] as unknown as string[]), r ?? '']));
            return acc;
          },
          [[], []] as string[][]
        )
        .map((p) => p.join(','));

      if (!(user && permissions)) {
        return { granted: false, permission, resource, action };
      }

      if (!user.is_active) {
        return { granted: false, permission, resource, action };
      }

      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      if (user.is_super_admin || user.is_admin) {
        return { granted: true, permission, resource, action };
      }

      if (
        typeof permission === 'string' &&
        permissions.some((p) => p.toLowerCase().trim() === permission.toLowerCase().trim())
      ) {
        return { granted: true, permission, resource, action };
      }

      if (
        Array.isArray(permission) &&
        permission.some((p1) =>
          permissions.some((p2) => p1.toLowerCase().trim() === p2.toLowerCase().trim())
        )
      ) {
        return { granted: true, permission, resource, action };
      }

      return { granted: false, permission, resource, action };
    },
    [user, permissions, options?.include]
  );

  return { getPermission };
};
