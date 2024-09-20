/**
 * Tiny helper to contruct better error messages from within the`try` clause.
 * This allow us to throw errors anywhere respond from the `catch` clause.
 * This pattern shouldn't be overused, but in some cases (long validation threads)
 * it makes more sense to do this than anything else.
 */
export function stringifyError(params: { message: string; status: number }) {
  return new Error(JSON.stringify(params));
}

/** Parse stringify error */
export function parseError(e: unknown): [{ message: string }, { status: number }] {
  if (e instanceof Error) {
    const data = parseJson<{ message: string; status: number }>(e.message);
    return [{ message: data?.message ?? e.message }, { status: data?.status ?? 500 }];
  }
  return [{ message: 'Failed to process request.' }, { status: 500 }];
}

function parseJson<T>(v: unknown) {
  if (typeof v !== 'string') return;
  try {
    return JSON.parse(v) as T;
  } catch (e) {
    return;
  }
}
