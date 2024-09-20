import { Hydrate } from '@/components/hydrate';
import { Users } from './components/users';

import { api } from '@/clients/api';
import { getQueryClient, parseServerSearchParams } from '@/utils/query';
import { dehydrate } from '@tanstack/react-query';
import { getUsersQueryKey } from './hooks/use-get-users';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const queryClient = getQueryClient();
  const queryKey = getUsersQueryKey(parseServerSearchParams(searchParams));
  await queryClient.prefetchQuery(queryKey, async () => {
    const users = await api.user.findMany.query(queryKey[2]);
    return JSON.parse(JSON.stringify(users)) as typeof users;
  });

  return (
    <Hydrate state={dehydrate(queryClient)}>
      <Users />
    </Hydrate>
  );
}
