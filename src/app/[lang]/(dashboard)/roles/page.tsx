import { Hydrate } from '@/components/hydrate';
import { Roles } from './components/roles';

import { api } from '@/clients/api';
import { getQueryClient, parseServerSearchParams } from '@/utils/query';
import { dehydrate } from '@tanstack/react-query';
import { getRolesQueryKey } from './hooks/use-get-roles';

export default async function RolesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const queryClient = getQueryClient();
  const queryKey = getRolesQueryKey(parseServerSearchParams(searchParams));
  await queryClient.prefetchQuery(queryKey, async () => {
    const roles = await api.role.findMany.query(queryKey[2]);
    return JSON.parse(JSON.stringify(roles)) as typeof roles;
  });

  return (
    <Hydrate state={dehydrate(queryClient)}>
      <Roles />
    </Hydrate>
  );
}
