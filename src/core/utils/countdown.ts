/**
 * Compute a human-readable countdown label from now to `endTime`.
 * Returns 'ENDED' when the time has passed, 'TBD' when endTime is falsy.
 */
export function getCountdown(endTime: string | Date): string {
  if (!endTime) return 'TBD';
  const end = new Date(endTime);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return 'ENDED';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}:${secs < 10 ? '0' + secs : secs}`;
}
