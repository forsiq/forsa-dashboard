'use client';

import { CheckCircle, PanelLeft, Layers } from 'lucide-react';
import { useLanguage } from '@yousef2001/core-ui/contexts';
import { cn } from '@core/lib/utils/cn';
import { useSidebarMode } from '@core/hooks/useSidebarMode';
import { AmberCard } from '@core/components/AmberCard';

export function NavigationTab() {
  const { t } = useLanguage();
  const { mode, setMode } = useSidebarMode();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-end-4 duration-500">
      <AmberCard className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-visible">
        <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.2em] mb-8 pb-4 border-b border-[var(--color-border)]">
          {t('settings.sidebar_mode')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            type="button"
            onClick={() => setMode('modular')}
            className={cn(
              'relative p-6 rounded-2xl border-2 transition-all text-start group',
              mode === 'modular'
                ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5 shadow-lg shadow-[var(--color-brand)]/10'
                : 'border-[var(--color-border)] bg-[var(--color-obsidian-card)] hover:border-white/20',
            )}
          >
            {mode === 'modular' && (
              <div className="absolute top-4 end-4">
                <CheckCircle className="w-5 h-5 text-[var(--color-brand)]" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  'p-2.5 rounded-xl',
                  mode === 'modular' ? 'bg-[var(--color-brand)]/15' : 'bg-white/5',
                )}
              >
                <PanelLeft
                  className={cn(
                    'w-5 h-5',
                    mode === 'modular' ? 'text-[var(--color-brand)]' : 'text-zinc-muted',
                  )}
                />
              </div>
              <h4 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                {t('settings.sidebar_modular')}
              </h4>
            </div>
            <p className="text-[13px] font-bold text-zinc-muted leading-relaxed uppercase">
              {t('settings.sidebar_modular_desc')}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMode('unified')}
            className={cn(
              'relative p-6 rounded-2xl border-2 transition-all text-start group',
              mode === 'unified'
                ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5 shadow-lg shadow-[var(--color-brand)]/10'
                : 'border-[var(--color-border)] bg-[var(--color-obsidian-card)] hover:border-white/20',
            )}
          >
            {mode === 'unified' && (
              <div className="absolute top-4 end-4">
                <CheckCircle className="w-5 h-5 text-[var(--color-brand)]" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  'p-2.5 rounded-xl',
                  mode === 'unified' ? 'bg-[var(--color-brand)]/15' : 'bg-white/5',
                )}
              >
                <Layers
                  className={cn(
                    'w-5 h-5',
                    mode === 'unified' ? 'text-[var(--color-brand)]' : 'text-zinc-muted',
                  )}
                />
              </div>
              <h4 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                {t('settings.sidebar_unified')}
              </h4>
            </div>
            <p className="text-[13px] font-bold text-zinc-muted leading-relaxed uppercase">
              {t('settings.sidebar_unified_desc')}
            </p>
          </button>
        </div>
      </AmberCard>
    </div>
  );
}
