import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { AmberButton } from '@core/components/AmberButton';
import { AmberCard } from '@core/components';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useCities, usePackageSizes, useSyncReference } from '../hooks';

/**
 * Reference data sync panel — shows cached counts of cities / package sizes
 * and an admin-only button to trigger a manual re-sync.
 */
export const ReferenceDataSync: React.FC = () => {
  const { t } = useLanguage();
  const cities = useCities();
  const sizes = usePackageSizes();
  const sync = useSyncReference();

  const handleSync = () => sync.mutate(undefined);

  return (
    <AmberCard className="p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-zinc-text">{t('shipping.reference.title')}</h3>
          <p className="text-xs text-zinc-muted mt-1">{t('shipping.reference.subtitle')}</p>
        </div>
        <AmberButton
          variant="secondary"
          size="sm"
          onClick={handleSync}
          disabled={sync.isPending}
        >
          {sync.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>{sync.isPending ? t('shipping.syncing') : t('shipping.sync_reference')}</span>
        </AmberButton>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
          <div className="text-xs text-zinc-muted uppercase tracking-widest mb-1">
            {t('shipping.cities')}
          </div>
          <div className="text-2xl font-bold text-zinc-text">
            {cities.data?.length ?? 0}
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
          <div className="text-xs text-zinc-muted uppercase tracking-widest mb-1">
            {t('shipping.package_sizes')}
          </div>
          <div className="text-2xl font-bold text-zinc-text">
            {sizes.data?.length ?? 0}
          </div>
        </div>
      </div>
    </AmberCard>
  );
};

export default ReferenceDataSync;
