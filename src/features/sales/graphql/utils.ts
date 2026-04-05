/**
 * Group Buying Utilities
 */

import { GroupBuying } from '../types';

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, locale = 'ar-IQ'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'IQD',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(originalPrice: number, dealPrice: number): number {
  if (!originalPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - dealPrice) / originalPrice) * 100);
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, max: number): number {
  if (!max || max <= 0) return 0;
  return Math.min(Math.round((current / max) * 100), 100);
}

/**
 * Get status badge variant
 */
export function getStatusVariant(status: GroupBuying['status']): string {
  const variants = {
    active: 'bg-green-500/20 text-green-300 border-green-500/30',
    unlocked: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    completed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    scheduled: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    expired: 'bg-red-500/20 text-red-300 border-red-500/30',
    cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
    draft: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  };
  return variants[status] || variants.draft;
}
