'use client';

import React from 'react';
import { Smartphone } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { usePwaInstallContext } from '@core/contexts/PwaInstallContext';
import { useIsMobile } from '@core/hooks/useIsMobile';

/** Optional compact entry on the login page — opens the install bottom sheet */
export function InstallAppLoginLink() {
  const { t } = useLanguage();
  const { openInstallSheet, canInstall } = usePwaInstallContext();
  const { isMobile } = useIsMobile();

  if (!isMobile || !canInstall) return null;

  return (
    <button
      type="button"
      onClick={openInstallSheet}
      className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-brand/25 bg-brand/5 text-brand text-[11px] font-black uppercase tracking-widest hover:bg-brand/10 transition-colors"
    >
      <Smartphone className="w-4 h-4" />
      {t('mobile.nav.download_app')}
    </button>
  );
}
