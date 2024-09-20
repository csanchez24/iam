export function parseJson<T>(v: unknown) {
  if (typeof v !== 'string') return;
  try {
    return JSON.parse(v) as T;
  } catch (e) {
    return;
  }
}
