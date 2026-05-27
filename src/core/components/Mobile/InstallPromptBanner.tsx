'use client';

import React from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { usePwaInstallContext } from '@core/contexts/PwaInstallContext';
import { cn } from '@core/lib/utils/cn';

interface InstallPromptBannerProps {
  onOpenSheet: () => void;
}

export function InstallPromptBanner({ onOpenSheet }: InstallPromptBannerProps) {
  const { t, isRTL } = useLanguage();
  const { dismissBanner, platform, install, isInstalling } = usePwaInstallContext();

  const handlePrimary = () => {
    if (platform === 'ios') {
      onOpenSheet();
      return;
    }
    void install();
  };

  return (
    <div
      className="sticky top-0 z-40 border-b border-brand/20 bg-gradient-to-r from-obsidian-card via-obsidian-card to-brand/5 backdrop-blur-md"
      role="region"
      aria-label={t('mobile.install.title')}
    >
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2.5',
          isRTL && 'flex-row-reverse',
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
          <Smartphone className="h-4 w-4" />
        </div>

        <button
          type="button"
          onClick={handlePrimary}
          disabled={isInstalling}
          className={cn(
            'flex-1 min-w-0 text-start',
            isRTL && 'text-end',
          )}
        >
          <p className="text-xs font-black uppercase tracking-tight text-zinc-text truncate">
            {t('mobile.install.title')}
          </p>
          <p className="text-[10px] text-zinc-muted truncate mt-0.5">
            {t('mobile.install.banner_cta')}
          </p>
        </button>

        <button
          type="button"
          onClick={handlePrimary}
          disabled={isInstalling}
          className={cn(
            'shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2',
            'bg-brand text-brand-text text-[10px] font-black uppercase tracking-wider',
            'hover:bg-brand-hover transition-colors disabled:opacity-60',
          )}
        >
          <Download className="h-3.5 w-3.5" />
          {platform === 'ios' ? t('mobile.install.open_instructions') : t('mobile.install.download')}
        </button>

        <button
          type="button"
          onClick={dismissBanner}
          className="shrink-0 p-1.5 rounded-lg text-zinc-muted hover:text-zinc-text hover:bg-white/10 transition-colors"
          aria-label={t('mobile.install.dismiss')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
