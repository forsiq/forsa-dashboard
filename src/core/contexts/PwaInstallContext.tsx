'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useIsMobile } from '@core/hooks/useIsMobile';
import { usePwaInstall, type UsePwaInstallResult } from '@core/hooks/usePwaInstall';
import { InstallPromptSheet } from '@core/components/Mobile/InstallPromptSheet';

interface PwaInstallContextValue extends UsePwaInstallResult {
  isSheetOpen: boolean;
  openInstallSheet: () => void;
  closeInstallSheet: () => void;
}

const PwaInstallContext = createContext<PwaInstallContextValue | undefined>(undefined);

export function PwaInstallProvider({ children }: { children: React.ReactNode }) {
  const { isMobile } = useIsMobile();
  const installState = usePwaInstall(isMobile);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const openInstallSheet = useCallback(() => {
    if (installState.canInstall) setIsSheetOpen(true);
  }, [installState.canInstall]);

  const closeInstallSheet = useCallback(() => setIsSheetOpen(false), []);

  const value = useMemo<PwaInstallContextValue>(
    () => ({
      ...installState,
      isSheetOpen,
      openInstallSheet,
      closeInstallSheet,
    }),
    [installState, isSheetOpen, openInstallSheet, closeInstallSheet],
  );

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
      <InstallPromptSheet
        isOpen={isSheetOpen}
        onClose={closeInstallSheet}
        platform={installState.platform}
        onInstall={installState.install}
        isInstalling={installState.isInstalling}
        isInstalled={installState.isInstalled}
      />
    </PwaInstallContext.Provider>
  );
}

export function usePwaInstallContext(): PwaInstallContextValue {
  const ctx = useContext(PwaInstallContext);
  if (!ctx) {
    throw new Error('usePwaInstallContext must be used within PwaInstallProvider');
  }
  return ctx;
}

/** Safe hook for optional consumers (e.g. nav sheet outside provider edge cases). */
export function usePwaInstallContextOptional(): PwaInstallContextValue | null {
  return useContext(PwaInstallContext) ?? null;
}
