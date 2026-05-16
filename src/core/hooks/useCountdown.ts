import { useState, useEffect } from 'react';
import { getCountdown } from '@core/utils/countdown';

/**
 * React hook that returns a ticking countdown string for the given end time.
 * Updates every second. Returns 'TBD' when endTime is null/undefined.
 */
export function useCountdown(endTime: string | Date | null | undefined): string {
  const [label, setLabel] = useState(() => (endTime ? getCountdown(endTime) : 'TBD'));

  useEffect(() => {
    if (!endTime) {
      setLabel('TBD');
      return;
    }
    const tick = () => setLabel(getCountdown(endTime));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return label;
}
