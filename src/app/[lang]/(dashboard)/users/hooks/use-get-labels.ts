import type { contract } from '@/server/api/contracts';
import type { ParseServerSearchParamsReturnType } from '@/utils/query';
import type { ClientInferRequest } from '@ts-rest/core';

import { api } from '@/clients/api';
import { useQuery } from '@tanstack/react-query';
import isEqual from 'lodash/isEqual';

type FindManyQueryOptions = Pick<ClientInferRequest<typeof contract.label.findMany>, 'query'>;

const DEFAULTS: FindManyQueryOptions['query'] = {
  include: { usersToLabels: false },
  sort: { createdAt: 'desc' },
  page: 1,
  limit: 100,
};

const QUERY_KEY = ['label', 'findMany', { query: DEFAULTS }] satisfies [
  'label',
  'findMany',
  FindManyQueryOptions,
];

export const getLabelsQueryKey = ({
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
        ...args,
        where: deboucedSearchText
          ? {
              _or: [{ name: { like: deboucedSearchText } }],
            }
          : undefined,
        ...DEFAULTS,
        ...args,
      },
    },
  ];
};

export const useGetLabels = (args?: Parameters<typeof getLabelsQueryKey>[0]) => {
  const queryKey = getLabelsQueryKey(args);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await api.label.findMany.query(queryKey[2]);
      return res.status === 200 ? res : null;
    },
  });
};
