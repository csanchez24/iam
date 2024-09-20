import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

import {
  QueryClient,
  type Query,
  type QueryClientConfig,
  type QueryKey,
} from '@tanstack/react-query';
import * as React from 'react';

/** React query's global client config */
export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      keepPreviousData: true,
      staleTime: 5 * (60 * 1000),
      cacheTime: 10 * (60 * 1000),
    },
  },
};

/** We call this everywhere in the server to pull the React query client from cache */
export const getQueryClient = React.cache(
  (config?: QueryClientConfig) => new QueryClient({ ...queryClientConfig, ...(config ?? {}) })
);

/**
 * Takes create of resetting cache for queries with key shaped as followed:
 * [(handler)string, (endpoint)string, (query options)object]
 */
/* eslint-disable */
export function invalidateQueries<T extends any[] | []>(queryKeys: T) {
  return function ({ queryKey }: Query<unknown, unknown, unknown, QueryKey>) {
    if (queryKeys.length === 0) {
      return false;
    }

    return queryKeys.some(
      (qk) =>
        qk.at(0) === queryKey.at(0) &&
        qk.at(1) === queryKey.at(1) &&
        (qk.at(2) && typeof qk.at(2) === 'number'
          ? (queryKey.at(2) as { params?: { id?: number } })?.params?.id === qk.at(2)
          : true)
    );
  };
}
/* eslint-enable */

export type ParseServerSearchParamsReturnType = {
  deboucedSearchText?: string;
  sort?: Record<string, 'asc' | 'desc'>;
  page: number;
  limit: number;
};

/**
 * Parses the search params in the server side and outputs a legible
 * object we can pass in to {handler}FindMany query with pagination info.
 * This ensures we can fetch in the server and produce a query key
 * that it's consistence across both server/client allowing cached data hydration.
 */
export function parseServerSearchParams(
  searchParams: Record<string, string | string[] | undefined>
) {
  const searchParamsCache = createSearchParamsCache({
    query: parseAsString.withDefault(''),
    sort: parseAsString.withDefault('createdAt,desc'),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  }).parse(searchParams);

  return Object.keys(searchParamsCache).reduce((params, param) => {
    if (param === 'query') {
      return { ...params, deboucedSearchText: searchParamsCache[param] };
    }
    if (param === 'sort') {
      return { ...params, sort: parseSortSearchParam(searchParamsCache[param]) };
    }

    return { ...params, [param]: searchParamsCache[param as keyof typeof searchParamsCache] };
  }, {} as ParseServerSearchParamsReturnType);
}

/**
 * Sort query param comes in the following shape sort={columnName},{dir}. This function
 * takes that shape and converts to a something our endpoint understands e.g. { [columnName]: {dir} }
 */
export function parseSortSearchParam(
  param: string | undefined | null,
  fallback?: Record<string, 'asc' | 'desc'>
) {
  if (param) {
    const [column, dir] = param.split(',') as [string, 'asc' | 'desc'];
    if (column && dir && ['asc', 'desc'].includes(dir.trim())) {
      return { [column.trim()]: dir };
    }
  }
  return fallback;
}
