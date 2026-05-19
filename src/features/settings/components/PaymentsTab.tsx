'use client';

import { CreditCard, DollarSign, Receipt, Percent } from 'lucide-react';
import { useLanguage } from '@yousef2001/core-ui/contexts';
import { AmberCard } from '@core/components/AmberCard';

export function PaymentsTab() {
  const { t } = useLanguage();

  const paymentMethods = [
    { key: 'cash_on_delivery', label: t('settings.cod') || 'Cash on Delivery', enabled: true },
    { key: 'credit_card', label: t('settings.credit_card') || 'Credit Card', enabled: false },
    { key: 'bank_transfer', label: t('settings.bank_transfer') || 'Bank Transfer', enabled: true },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-end-4 duration-500">
      <AmberCard className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">
        <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.2em] mb-8 pb-4 border-b border-[var(--color-border)]">
          {t('settings.payment_settings') || 'Payment Settings'}
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest block mb-2 text-start">
                {t('settings.currency') || 'Currency'}
              </label>
              <div className="h-11 px-4 flex items-center gap-2 bg-[var(--color-obsidian-outer)] border border-[var(--color-border)] rounded-xl text-sm text-zinc-text font-bold">
                <DollarSign className="w-4 h-4 text-zinc-muted" />
                IQD - Iraqi Dinar
              </div>
            </div>
            <div>
              <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest block mb-2 text-start">
                {t('settings.tax_rate') || 'Tax Rate'}
              </label>
              <div className="h-11 px-4 flex items-center gap-2 bg-[var(--color-obsidian-outer)] border border-[var(--color-border)] rounded-xl text-sm text-zinc-text font-bold">
                <Percent className="w-4 h-4 text-zinc-muted" />
                0%
              </div>
            </div>
          </div>

          <div className="pt-4">
            <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest block mb-4 text-start">
              {t('settings.payment_methods') || 'Payment Methods'}
            </label>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.key}
                  className="flex items-center justify-between p-4 bg-[var(--color-obsidian-outer)] border border-[var(--color-border)] rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-zinc-muted" />
                    <span className="text-sm font-bold text-zinc-text">{method.label}</span>
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    method.enabled
                      ? 'bg-success/10 text-success border border-success/20'
                      : 'bg-white/5 text-zinc-muted border border-white/10'
                  }`}>
                    {method.enabled ? (t('settings.enabled') || 'Enabled') : (t('settings.disabled') || 'Disabled')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AmberCard>
    </div>
  );
}
