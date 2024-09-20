'use client';

import type { ClientInferRequest } from '@ts-rest/core';
import type { contract } from '@/server/api/contracts';

import { api } from '@/clients/api';
import { useQuery } from '@tanstack/react-query';

type FindUniqueParams = Pick<ClientInferRequest<typeof contract.role.findUnique>, 'params'>;

const GET_APP_BASE_KEYS = ['role', 'findUnique'] as const;
export const getRoleQueryKey = (
  id?: number
): [(typeof GET_APP_BASE_KEYS)[0], (typeof GET_APP_BASE_KEYS)[1], FindUniqueParams] | [] => {
  return id
    ? [GET_APP_BASE_KEYS[0], GET_APP_BASE_KEYS[1], { params: { id } } satisfies FindUniqueParams]
    : [];
};

export const useGetRole = (id: number | undefined) => {
  const queryKey = getRoleQueryKey(id);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await api.role.findUnique.query({
        ...(queryKey.at(2) as FindUniqueParams),
        query: {},
      });
      return res.status === 200 ? res : null;
    },
    enabled: !!id,
  });
};
