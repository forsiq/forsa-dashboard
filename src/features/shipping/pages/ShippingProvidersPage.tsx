import React from 'react';
import { Loader2 } from 'lucide-react';
import { AmberCard } from '@core/components';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useProviders, useToggleProvider } from '../hooks';
import { AmberToggle } from '@core/components';
import { ProviderCredentialsForm } from '../components/ProviderCredentialsForm';
import { ReferenceDataSync } from '../components/ReferenceDataSync';

/**
 * ShippingProvidersPage — surfaces the Al-Waseet provider configuration
 * (enable/disable toggle + credentials form) plus the reference-data sync
 * panel. Used inside Settings > Shipping tab.
 */
export const ShippingProvidersPage: React.FC = () => {
  const { t } = useLanguage();
  const providers = useProviders();
  const toggle = useToggleProvider();

  const provider = providers.data?.find((p) => p.providerName === 'alwaseet') ?? null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-end-4 duration-500">
      {/* Enable toggle */}
      <AmberCard className="p-6">
        <div className="flex items-center justify-between p-4 rounded-xl bg-obsidian-panel/30 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-info" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7h13l3 4h2v6h-3" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold text-zinc-text">
                {t('shipping.enabled')}
              </span>
              <p className="text-[11px] text-zinc-muted">{t('shipping.enabled_desc')}</p>
            </div>
          </div>
          <AmberToggle
            enabled={!!provider?.isActive}
            onChange={(v) =>
              toggle.mutate({
                providerName: 'alwaseet',
                isActive: v,
                environment: provider?.environment,
              })
            }
            label={t('shipping.enabled')}
          />
        </div>

        {providers.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-muted" />
          </div>
        ) : provider ? null : (
          <p className="text-[11px] text-zinc-muted mt-4">{t('shipping.no_provider_configured')}</p>
        )}
      </AmberCard>

      {/* Credentials — keyed on provider identity so it remounts (and reseeds
          its local form state) whenever the loaded provider changes. */}
      <ProviderCredentialsForm key={provider?.id ?? 'none'} provider={provider} />

      {/* Reference data */}
      <ReferenceDataSync />
    </div>
  );
};

export default ShippingProvidersPage;
