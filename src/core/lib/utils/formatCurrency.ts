/**
 * Unified currency formatting for Forsa admin dashboard.
 * All prices are in IQD (Iraqi Dinar).
 */

export function formatCurrency(amount: number | null | undefined): string {
  const num = typeof amount === 'number' ? amount : 0;
  if (isNaN(num)) return '0 د.ع';
  const formatted = Math.floor(num).toLocaleString('en-US');
  return `${formatted} د.ع`;
}

export function formatCurrencyShort(amount: number | null | undefined): string {
  const num = typeof amount === 'number' ? amount : 0;
  if (isNaN(num) || num === 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return Math.floor(num).toLocaleString('en-US');
}
