/**
 * True when a report series has at least one positive numeric point.
 */
export function hasChartValues<T extends Record<string, unknown>>(
  data: T[] | undefined | null,
  valueKeys: string[] = ['value', 'revenue', 'bids', 'sales']
): boolean {
  if (!data?.length) return false;
  return data.some((row) =>
    valueKeys.some((key) => {
      const v = row[key];
      return typeof v === 'number' && Number.isFinite(v) && v > 0;
    })
  );
}
