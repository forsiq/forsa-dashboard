'use client';

import { InstallPromptBanner } from '@core/components/Mobile/InstallPromptBanner';
import { usePwaInstallContext } from '@core/contexts/PwaInstallContext';

/** Renders the mobile install banner when context says it should show. */
export function InstallPromptBannerGate() {
  const { showMobileBanner, openInstallSheet } = usePwaInstallContext();
  if (!showMobileBanner) return null;
  return <InstallPromptBanner onOpenSheet={openInstallSheet} />;
}
