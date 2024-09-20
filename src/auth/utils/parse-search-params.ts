import type { ZodType } from 'zod';

function convertSearchParamsToObj<T extends Record<string, string>>(searchParams: URLSearchParams) {
  return Array.from(searchParams.entries()).reduce((acc, cur) => {
    return { ...acc, [cur[0]]: cur[1] };
  }, {} as T);
}

export function parseSearchParams<T>(searchParams: URLSearchParams, schema: ZodType<T>) {
  const obj = convertSearchParamsToObj(searchParams);
  return schema.safeParse(obj);
}
