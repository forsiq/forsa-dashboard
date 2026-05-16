/** Default schedule window: end = start + 2 days (48h). */
export const SCHEDULE_END_OFFSET_DAYS = 2;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** AmberDatePicker value format: `YYYY-MM-DDTHH:mm` */
export function addDaysToDatetimeLocal(startTime: string, days: number): string {
  const start = new Date(startTime);
  if (Number.isNaN(start.getTime())) return '';
  const end = new Date(start.getTime() + days * MS_PER_DAY);
  return end.toISOString().slice(0, 16);
}

export function computeDefaultScheduleEndTime(startTime: string): string {
  return addDaysToDatetimeLocal(startTime, SCHEDULE_END_OFFSET_DAYS);
}

/**
 * Whether selecting/changing start should auto-fill end.
 * Respects a manual end when it is strictly after start unless `wasEndAutoDerived`.
 */
export function shouldAutoSetScheduleEnd(
  startTime: string,
  endTime: string,
  wasEndAutoDerived: boolean,
): boolean {
  if (!startTime) return false;
  if (!endTime) return true;

  const startMs = new Date(startTime).getTime();
  const endMs = new Date(endTime).getTime();
  if (Number.isNaN(startMs)) return false;
  if (Number.isNaN(endMs)) return true;
  if (endMs <= startMs) return true;

  return wasEndAutoDerived;
}
