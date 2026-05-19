'use client';

import { Truck, MapPin } from 'lucide-react';
import { useLanguage } from '@yousef2001/core-ui/contexts';
import { AmberCard } from '@core/components/AmberCard';

export function ShippingTab() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-end-4 duration-500">
      <AmberCard className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">
        <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.2em] mb-8 pb-4 border-b border-[var(--color-border)]">
          {t('settings.shipping_settings') || 'Shipping Settings'}
        </h3>

        <div className="space-y-6">
          <div className="p-6 bg-[var(--color-obsidian-outer)] border border-[var(--color-border)] rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-brand/10">
                <MapPin className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                {t('settings.shipping_zones') || 'Shipping Zones'}
              </h4>
            </div>
            <p className="text-[13px] text-zinc-muted font-medium">
              {t('settings.shipping_zones_desc') || 'No shipping zones configured. Shipping zones allow you to set different rates based on delivery location.'}
            </p>
          </div>

          <div className="p-6 bg-[var(--color-obsidian-outer)] border border-[var(--color-border)] rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-info/10">
                <Truck className="w-4 h-4 text-info" />
              </div>
              <h4 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                {t('settings.delivery_options') || 'Delivery Options'}
              </h4>
            </div>
            <p className="text-[13px] text-zinc-muted font-medium">
              {t('settings.delivery_options_desc') || 'Standard delivery (3-5 business days) and Express delivery (1-2 business days) are available by default.'}
            </p>
          </div>
        </div>
      </AmberCard>
    </div>
  );
}
