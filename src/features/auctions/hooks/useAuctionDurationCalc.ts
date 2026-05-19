import { useState } from 'react';

const HISTORY_KEY = 'history_auction';

function readAuctionHistory(): Record<string, any> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useAuctionDurationCalc(startTime: string | undefined) {
  const [durationDays, setDurationDays] = useState<number>(() => {
    const h = readAuctionHistory();
    return h?.durationDays ?? 7;
  });
  const [useDurationMode, setUseDurationMode] = useState<boolean>(true);

  // Compute endTime from startTime + durationDays
  const computedEndTime = startTime
    ? (() => {
        const start = new Date(startTime);
        start.setDate(start.getDate() + durationDays);
        return start.toISOString().slice(0, 16);
      })()
    : '';

  return { durationDays, setDurationDays, useDurationMode, setUseDurationMode, computedEndTime };
}
