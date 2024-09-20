import type { AppRouter, ClientArgs } from '@ts-rest/core';

import { tsRestFetchApi } from '@ts-rest/core';
import { initQueryClient } from '@ts-rest/react-query';
import { headers } from 'next/headers.js';

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

/**
 * Isomorphically get the authorization header needed to authenticate req.
 * Forwards the raw `cookie` prop when on server side calls else send `cookie` as is.
 */
const setIsomorphicHeaders = (extraHeaders: Record<string, string> = {}): typeof extraHeaders => {
  // There's nothing we need to do as we're on a browser
  if (typeof window !== 'undefined') {
    return extraHeaders;
  }

  // Set cookie manually when working on the server side. This works
  // great when withing a nextjs page, however it will fail inside of middleware.js.
  const headersList = headers();
  return {
    ...extraHeaders,
    cookie: headersList.get('cookie') ?? '',
  };
};

// Create new instance of abort controller in order to stop request on invalid token
const abortController = new AbortController();

/** Factory function that handles initiation of ts-rest client */
export const createTsRestNextClient = <
  T extends AppRouter,
  TClientArgs extends Omit<ClientArgs, 'baseHeaders'> & Partial<Pick<ClientArgs, 'baseHeaders'>>,
>(
  router: T,
  { baseHeaders, ...clientArgs }: TClientArgs
) => {
  return initQueryClient(router, {
    jsonQuery: true,
    baseHeaders: baseHeaders ?? {},
    credentials: 'include',
    ...clientArgs,
    api: async ({ headers, ...args }) => {
      try {
        return tsRestFetchApi({
          ...args,
          headers: setIsomorphicHeaders(headers),
          signal: abortController.signal,
        });
      } catch (e) {
        console.log('[Error] @ initQueryClient.api > ', e);
        abortController.abort();
        return tsRestFetchApi({
          ...args,
          headers,
          signal: abortController.signal,
        });
      }
    },
  });
};
