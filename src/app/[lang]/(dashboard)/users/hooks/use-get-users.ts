import type { contract } from '@/server/api/contracts';
import type { ParseServerSearchParamsReturnType } from '@/utils/query';
import type { ClientInferRequest } from '@ts-rest/core';

import { api } from '@/clients/api';
import { useQuery } from '@tanstack/react-query';
import isEqual from 'lodash/isEqual';

type FindManyQueryOptions = Pick<ClientInferRequest<typeof contract.user.findMany>, 'query'>;

const DEFAULTS: FindManyQueryOptions['query'] = {
  include: { usersToRoles: true, usersToLabels: true },
  sort: { createdAt: 'desc' },
  page: 1,
  limit: 10,
};

const QUERY_KEY = ['user', 'findMany', { query: DEFAULTS }] satisfies [
  'user',
  'findMany',
  FindManyQueryOptions,
];

export const getUsersQueryKey = ({
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
              _or: [
                { firstName: { like: deboucedSearchText } },
                { lastName: { like: deboucedSearchText } },
                { email: { like: deboucedSearchText } },
              ],
            }
          : undefined,
        ...DEFAULTS,
        ...args,
      },
    },
  ];
};

export const useGetUsers = (args?: Parameters<typeof getUsersQueryKey>[0]) => {
  const queryKey = getUsersQueryKey(args);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await api.user.findMany.query(queryKey[2]);
      return res.status === 200 ? res : null;
    },
  });
};
