import type { contract } from '@/server/api/contracts';
import type { ParseServerSearchParamsReturnType } from '@/utils/query';
import type { ClientInferRequest } from '@ts-rest/core';

import { api } from '@/clients/api';
import { useQuery } from '@tanstack/react-query';
import isEqual from 'lodash/isEqual';

type FindManyQueryOptions = Pick<ClientInferRequest<typeof contract.application.findMany>, 'query'>;

const DEFAULTS: FindManyQueryOptions['query'] = {
  include: { permissions: true },
  sort: { createdAt: 'desc' },
  page: 1,
  limit: 10,
};

const QUERY_KEY = ['application', 'findMany', { query: DEFAULTS }] satisfies [
  'application',
  'findMany',
  FindManyQueryOptions,
];

export const getApplicationsQueryKey = ({
  deboucedSearchText,
  ...args
}: FindManyQueryOptions['query'] &
  Pick<ParseServerSearchParamsReturnType, 'deboucedSearchText'> = DEFAULTS):
  | typeof QUERY_KEY
  | [(typeof QUERY_KEY)[0], (typeof QUERY_KEY)[1], FindManyQueryOptions] => {
  if (!deboucedSearchText && isEqual(args, DEFAULTS)) {
    return QUERY_KEY;
  }

  return [
    QUERY_KEY[0],
    QUERY_KEY[1],
    {
      query: {
        where: deboucedSearchText
          ? {
              _or: [
                { key: { like: deboucedSearchText } },
                { name: { like: deboucedSearchText } },
                { domain: { like: deboucedSearchText } },
              ],
            }
          : undefined,
        ...DEFAULTS,
        ...args,
      },
    },
  ];
};

export const useGetApplications = (args?: Parameters<typeof getApplicationsQueryKey>[0]) => {
  const queryKey = getApplicationsQueryKey(args);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await api.application.findMany.query(queryKey[2]);
      return res.status === 200 ? res : null;
    },
  });
};
