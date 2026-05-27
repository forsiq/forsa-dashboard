'use client';

import { useCallback, useEffect, useState } from 'react';
import type { BeforeInstallPromptEvent } from '@core/components/Mobile/pwa-install.types';
import type { PwaInstallPlatform } from '@core/components/Mobile/pwa-install.types';

const BANNER_DISMISS_KEY = 'forsa-install-banner-dismissed';
const BANNER_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    nav.standalone === true
  );
}

function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function readBannerDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(BANNER_DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number.parseInt(raw, 10);
    if (Number.isNaN(dismissedAt)) return false;
    return Date.now() - dismissedAt < BANNER_DISMISS_MS;
  } catch {
    return false;
  }
}

function writeBannerDismissed(): void {
  try {
    window.localStorage.setItem(BANNER_DISMISS_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export interface UsePwaInstallResult {
  isStandalone: boolean;
  isInstalled: boolean;
  platform: PwaInstallPlatform;
  canInstall: boolean;
  isBannerDismissed: boolean;
  showMobileBanner: boolean;
  dismissBanner: () => void;
  install: () => Promise<void>;
  isInstalling: boolean;
}

export function usePwaInstall(isMobile: boolean): UsePwaInstallResult {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

  const isIOS = isIOSDevice();
  const platform: PwaInstallPlatform = deferredPrompt
    ? 'chromium'
    : isIOS
      ? 'ios'
      : 'none';

  const canInstall = !isStandalone && !isInstalled && (platform === 'chromium' || platform === 'ios');

  useEffect(() => {
    setIsStandalone(isStandaloneMode());
    setIsInstalled(isStandaloneMode());
    setIsBannerDismissed(readBannerDismissed());

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    const onDisplayModeChange = () => {
      const standalone = isStandaloneMode();
      setIsStandalone(standalone);
      if (standalone) setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);
    const mql = window.matchMedia('(display-mode: standalone)');
    mql.addEventListener('change', onDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
      mql.removeEventListener('change', onDisplayModeChange);
    };
  }, []);

  const dismissBanner = useCallback(() => {
    writeBannerDismissed();
    setIsBannerDismissed(true);
  }, []);

  const install = useCallback(async () => {
    if (platform === 'ios') return;
    if (!deferredPrompt) return;

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } catch {
      /* user dismissed or browser blocked */
    } finally {
      setIsInstalling(false);
    }
  }, [deferredPrompt, platform]);

  const showMobileBanner = isMobile && canInstall && !isBannerDismissed;

  return {
    isStandalone,
    isInstalled,
    platform,
    canInstall,
    isBannerDismissed,
    showMobileBanner,
    dismissBanner,
    install,
    isInstalling,
  };
}
