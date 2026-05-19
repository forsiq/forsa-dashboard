'use client';

import { CheckCircle, Sun, Moon } from 'lucide-react';
import { useLanguage, useTheme } from '@yousef2001/core-ui/contexts';
import { cn } from '@core/lib/utils/cn';
import { AmberCard } from '@core/components/AmberCard';

export function AuctionTab() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-end-4 duration-500">
      <AmberCard className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">
        <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.2em] mb-8 pb-4 border-b border-[var(--color-border)]">
          {t('settings.appearance') || 'Appearance'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            type="button"
            onClick={() => { if (theme === 'dark') toggleTheme(); }}
            className={cn(
              'relative p-6 rounded-2xl border-2 transition-all text-start group',
              theme !== 'dark'
                ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5 shadow-lg shadow-[var(--color-brand)]/10'
                : 'border-[var(--color-border)] bg-[var(--color-obsidian-card)] hover:border-white/20',
            )}
          >
            {theme !== 'dark' && (
              <div className="absolute top-4 end-4">
                <CheckCircle className="w-5 h-5 text-[var(--color-brand)]" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                'p-2.5 rounded-xl',
                theme !== 'dark' ? 'bg-[var(--color-brand)]/15' : 'bg-white/5',
              )}>
                <Sun className={cn(
                  'w-5 h-5',
                  theme !== 'dark' ? 'text-[var(--color-brand)]' : 'text-zinc-muted',
                )} />
              </div>
              <h4 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                {t('settings.light_mode') || 'Light Mode'}
              </h4>
            </div>
            <p className="text-[13px] font-bold text-zinc-muted leading-relaxed uppercase">
              {t('settings.light_mode_desc') || 'Clean and bright interface'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => { if (theme !== 'dark') toggleTheme(); }}
            className={cn(
              'relative p-6 rounded-2xl border-2 transition-all text-start group',
              theme === 'dark'
                ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5 shadow-lg shadow-[var(--color-brand)]/10'
                : 'border-[var(--color-border)] bg-[var(--color-obsidian-card)] hover:border-white/20',
            )}
          >
            {theme === 'dark' && (
              <div className="absolute top-4 end-4">
                <CheckCircle className="w-5 h-5 text-[var(--color-brand)]" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                'p-2.5 rounded-xl',
                theme === 'dark' ? 'bg-[var(--color-brand)]/15' : 'bg-white/5',
              )}>
                <Moon className={cn(
                  'w-5 h-5',
                  theme === 'dark' ? 'text-[var(--color-brand)]' : 'text-zinc-muted',
                )} />
              </div>
              <h4 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                {t('settings.dark_mode') || 'Dark Mode'}
              </h4>
            </div>
            <p className="text-[13px] font-bold text-zinc-muted leading-relaxed uppercase">
              {t('settings.dark_mode_desc') || 'Easy on the eyes, designed for extended use'}
            </p>
          </button>
        </div>
      </AmberCard>
    </div>
  );
}
