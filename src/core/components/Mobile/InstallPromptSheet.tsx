'use client';

import React from 'react';
import {
  Download,
  Share,
  PlusSquare,
  Check,
  Smartphone,
  Loader2,
} from 'lucide-react';
import { BottomSheet } from '@core/components/Mobile/BottomSheet';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import type { PwaInstallPlatform } from '@core/components/Mobile/pwa-install.types';

interface InstallPromptSheetProps {
  isOpen: boolean;
  onClose: () => void;
  platform: PwaInstallPlatform;
  onInstall: () => Promise<void>;
  isInstalling: boolean;
  isInstalled: boolean;
}

function StepRow({
  step,
  icon: Icon,
  text,
  isRTL,
}: {
  step: number;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  isRTL: boolean;
}) {
  return (
    <li
      className={cn(
        'flex items-start gap-4 rounded-xl bg-obsidian-outer border border-white/5 p-4',
        isRTL && 'flex-row-reverse text-right',
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-sm font-black text-brand">
        {step}
      </span>
      <div className={cn('flex flex-1 items-center gap-3 min-w-0', isRTL && 'flex-row-reverse')}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-zinc-text leading-snug">{text}</p>
      </div>
    </li>
  );
}

export function InstallPromptSheet({
  isOpen,
  onClose,
  platform,
  onInstall,
  isInstalling,
  isInstalled,
}: InstallPromptSheetProps) {
  const { t, isRTL } = useLanguage();

  if (platform === 'none' && !isInstalled) return null;

  const title = isInstalled
    ? t('mobile.install.already_installed')
    : platform === 'ios'
      ? t('mobile.install.ios_title')
      : t('mobile.install.title');

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        {/* App identity */}
        <div
          className={cn(
            'flex items-center gap-4 rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/10 to-transparent p-4',
            isRTL && 'flex-row-reverse',
          )}
        >
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-obsidian-outer shadow-lg shadow-brand/10">
            <Smartphone className="h-8 w-8 text-brand" aria-hidden />
          </div>
          <div className={cn('min-w-0 flex-1', isRTL ? 'text-right' : 'text-left')}>
            <p className="text-lg font-black uppercase tracking-tight text-zinc-text">Forsa</p>
            <p className="text-xs text-zinc-muted leading-relaxed mt-1">
              {isInstalled
                ? t('mobile.install.already_installed')
                : t('mobile.install.description')}
            </p>
          </div>
        </div>

        {isInstalled ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-success/10 border border-success/20 py-4 text-success">
            <Check className="h-5 w-5" />
            <span className="text-sm font-bold">{t('mobile.install.already_installed')}</span>
          </div>
        ) : platform === 'ios' ? (
          <ol className="space-y-3 list-none p-0 m-0">
            <StepRow
              step={1}
              icon={Share}
              text={t('mobile.install.ios_step1')}
              isRTL={isRTL}
            />
            <StepRow
              step={2}
              icon={PlusSquare}
              text={t('mobile.install.ios_step2')}
              isRTL={isRTL}
            />
            <StepRow
              step={3}
              icon={Check}
              text={t('mobile.install.ios_step3')}
              isRTL={isRTL}
            />
          </ol>
        ) : (
          <button
            type="button"
            disabled={isInstalling}
            onClick={() => void onInstall()}
            className={cn(
              'w-full flex items-center justify-center gap-3 rounded-xl py-4 px-6',
              'bg-brand text-brand-text font-black uppercase tracking-widest text-sm',
              'shadow-lg shadow-brand/25 hover:bg-brand-hover transition-colors',
              'disabled:opacity-60 disabled:cursor-not-allowed',
            )}
          >
            {isInstalling ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            {t('mobile.install.download')}
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-muted hover:text-zinc-text transition-colors"
        >
          {t('mobile.install.dismiss')}
        </button>
      </div>
    </BottomSheet>
  );
}
