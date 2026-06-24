const HISTORY_KEY = 'history_auction';

function readDurationDays(): number {
  if (typeof window === 'undefined') return 7;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const days = Number(parsed?.durationDays);
    return Number.isFinite(days) && days >= 1 ? days : 7;
  } catch {
    return 7;
  }
}

/** Default datetime-local values for new auction windows (start ≈ now+1h, end = start + duration). */
export function getDefaultAuctionSchedule(durationDays = readDurationDays()) {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);

  const end = new Date(now);
  end.setDate(end.getDate() + durationDays);

  return {
    startTime: now.toISOString().slice(0, 16),
    endTime: end.toISOString().slice(0, 16),
    durationDays,
  };
}
