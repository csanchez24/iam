'use client';

import type { contract } from '@/server/api/contracts';
import type { ClientInferRequest } from '@ts-rest/core';

import { api } from '@/clients/api';
import { useQuery } from '@tanstack/react-query';

type FindUniqueParams = Pick<ClientInferRequest<typeof contract.label.findUnique>, 'params'>;

const GET_APP_BASE_KEYS = ['label', 'findUnique'] as const;
export const getLabelQueryKey = (
  id?: number
): [(typeof GET_APP_BASE_KEYS)[0], (typeof GET_APP_BASE_KEYS)[1], FindUniqueParams] | [] => {
  return id
    ? [GET_APP_BASE_KEYS[0], GET_APP_BASE_KEYS[1], { params: { id } } satisfies FindUniqueParams]
    : [];
};

export const useGetLabel = (id: number | undefined) => {
  const queryKey = getLabelQueryKey(id);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await api.label.findUnique.query({
        ...(queryKey.at(2) as FindUniqueParams),
        query: {},
      });
      return res.status === 200 ? res : null;
    },
    enabled: !!id,
  });
};
