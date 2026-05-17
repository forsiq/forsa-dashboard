import { useMemo } from 'react';
import { getCountdown } from '@core/utils/countdown';
import { useSharedNow } from '@core/contexts/TimerContext';

export function useCountdown(endTime: string | Date | null | undefined): string {
  const now = useSharedNow();

  return useMemo(() => {
    if (!endTime) return 'TBD';
    return getCountdown(endTime);
  }, [endTime, now]);
}
