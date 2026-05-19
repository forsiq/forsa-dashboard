'use client';

import { useLanguage } from '@yousef2001/core-ui/contexts';
import { AmberCard } from '@core/components/AmberCard';

export function GeneralTab() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-end-4 duration-500">
      <AmberCard className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">
        <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.2em] mb-8 pb-4 border-b border-[var(--color-border)]">
          {t('settings.general_info') || 'General Information'}
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest block mb-2 text-start">
                {t('settings.project_name') || 'Project Name'}
              </label>
              <div className="h-11 px-4 flex items-center bg-[var(--color-obsidian-outer)] border border-[var(--color-border)] rounded-xl text-sm text-zinc-text font-bold">
                Forsa Auctions
              </div>
            </div>
            <div>
              <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest block mb-2 text-start">
                {t('settings.project_id') || 'Project ID'}
              </label>
              <div className="h-11 px-4 flex items-center bg-[var(--color-obsidian-outer)] border border-[var(--color-border)] rounded-xl text-sm text-zinc-text font-bold">
                11
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest block mb-2 text-start">
              {t('settings.description') || 'Description'}
            </label>
            <div className="px-4 py-3 bg-[var(--color-obsidian-outer)] border border-[var(--color-border)] rounded-xl text-sm text-zinc-text font-medium leading-relaxed">
              Forsa is a real-time auction platform for managing and participating in live auctions.
            </div>
          </div>
        </div>
      </AmberCard>
    </div>
  );
}
