import { Hydrate } from '@/components/hydrate';
import { Applications } from './components/applications';

import { api } from '@/clients/api';
import { getQueryClient, parseServerSearchParams } from '@/utils/query';
import { dehydrate } from '@tanstack/react-query';
import { getApplicationsQueryKey } from './hooks/use-get-applications';

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const queryClient = getQueryClient();
  const queryKey = getApplicationsQueryKey(parseServerSearchParams(searchParams));
  await queryClient.prefetchQuery(queryKey, async () => {
    const applications = await api.application.findMany.query(queryKey[2]);
    return JSON.parse(JSON.stringify(applications)) as typeof applications;
  });

  return (
    <Hydrate state={dehydrate(queryClient)}>
      <Applications />
    </Hydrate>
  );
}
