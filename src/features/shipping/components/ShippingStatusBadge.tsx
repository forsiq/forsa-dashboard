import React from 'react';
import { cn } from '@core/lib/utils/cn';
import { useLanguage } from '@core/contexts/LanguageContext';
import type { ShipmentInfo } from '../types';

/**
 * Maps Al-Waseet status text/id to one of our canonical status buckets so we
 * can render a consistent badge color regardless of the provider's wording.
 */
function resolveStatusKey(shipment: ShipmentInfo | null | undefined): string {
  const our = shipment?.ourStatus;
  if (our === 'shipped' || our === 'delivered' || our === 'cancelled') return our;

  const text = (shipment?.providerStatusText || '').toLowerCase();
  if (!text && !shipment?.providerStatusId) return 'pending';
  if (text.includes('deliver') || text.includes('توصيل') || text.includes('تم')) return 'delivered';
  if (text.includes('cancel') || text.includes('إلغ')) return 'cancelled';
  if (text.includes('return') || text.includes('رجوع') || text.includes('إرجاع')) return 'returned';
  if (text.includes('process') || text.includes('تحت') || text.includes('قيد')) return 'processing';
  if (shipment?.providerStatusId) return 'shipped';
  return 'unknown';
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  returned: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  unknown: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

export interface ShippingStatusBadgeProps {
  shipment?: ShipmentInfo | null;
  statusKey?: string;
  className?: string;
  showRawText?: boolean;
}

export const ShippingStatusBadge: React.FC<ShippingStatusBadgeProps> = ({
  shipment,
  statusKey,
  className,
  showRawText = true,
}) => {
  const { t } = useLanguage();
  const key = statusKey ?? resolveStatusKey(shipment);
  const label =
    showRawText && shipment?.providerStatusText
      ? shipment.providerStatusText
      : t(`shipping.status.${key}`) || key;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
        STATUS_STYLES[key] ?? STATUS_STYLES.unknown,
        className,
      )}
    >
      {label}
    </span>
  );
};

export default ShippingStatusBadge;
