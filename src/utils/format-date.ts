import { format as _format, isValid } from 'date-fns';

export const formatDate = (
  date: Date | number | string | undefined | null,
  format: string,
  opts?: { defaultResult?: string; timeZone?: string }
) => {
  const defaultResult = opts?.defaultResult ?? '-';
  const timeZone = opts?.timeZone ?? 'America/New_York';

  if (!(date && isValid(new Date(date)))) {
    return defaultResult;
  }

  return _format(
    new Date(new Date(date).toLocaleString('en-US', { timeZone })),
    format
  );
};
