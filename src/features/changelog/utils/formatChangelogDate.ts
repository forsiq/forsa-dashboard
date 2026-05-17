import dayjs from 'dayjs';

/** Changelog display date: YYYY.M.D (e.g. 2026.5.16) */
export function formatChangelogDate(date: string): string {
  const d = dayjs(date);
  if (!d.isValid()) return date;
  return `${d.year()}.${d.month() + 1}.${d.date()}`;
}
