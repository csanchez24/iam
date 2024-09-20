// TODO: This is bare bones as of right now, but we could develop
// this util fn to accept more options and handle more status codes
// and better error messages.

export function isError(e: unknown): e is Error {
  return !!(e && typeof e === 'object' && 'message' in e && typeof e.message === 'string');
}

/** Handle 400 and 500 responses with a simple { message: string } payload */
export const genTsRestErrorRes = (
  e: unknown,
  options?: { genericMsg?: string; cb?: (e: string) => void }
) => {
  if (isError(e)) {
    options?.cb?.(e.message);
    return { status: 400, body: { message: e.message } } as const;
  }

  const message = options?.genericMsg ?? 'Something went wrong processing your request.';

  options?.cb?.(message);

  return { status: 500, body: { message } } as const;
};
