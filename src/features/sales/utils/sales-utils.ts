/**
 * Sales Utility Functions
 */

/**
 * Format number as currency
 */
export function formatCurrency(amount: number | string, currency = 'IQD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return `0 ${currency}`;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num).replace('$', '') + ' ' + currency;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(originalPrice: number, dealPrice: number): number {
  if (!originalPrice || originalPrice <= 0) return 0;
  const discount = ((originalPrice - dealPrice) / originalPrice) * 100;
  return Math.round(discount);
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, target: number): number {
  if (!target || target <= 0) return 0;
  const progress = (current / target) * 100;
  return Math.min(100, Math.round(progress));
}

/**
 * Get status variant for AmberBadge
 */
export function getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'secondary' {
  const s = status.toLowerCase();
  if (['active', 'completed', 'successful', 'paid', 'approved'].includes(s)) return 'success';
  if (['pending', 'processing', 'ongoing', 'scheduled'].includes(s)) return 'warning';
  if (['failed', 'cancelled', 'expired', 'rejected'].includes(s)) return 'danger';
  if (['closed', 'ended'].includes(s)) return 'secondary';
  return 'primary';
}
