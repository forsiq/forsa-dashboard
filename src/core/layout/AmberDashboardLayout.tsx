'use client';

/**
 * Forsa fork of the Amber shell layout: same UX as `@yousef2001/core-ui` dashboard layout
 * but uses `ForsaSidebar` (Next.js `Link`, longest-prefix active state, feature flags, exit-to-portal).
 * Path alias `@core/layout/*` points here intentionally — keep in sync with core-ui when upgrading the package.
 */

import React, { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/router';
import { AmberTopbar } from '@yousef2001/core-ui/layout/components/Topbar';
import { useLanguage, useTheme } from '@yousef2001/core-ui/contexts';
import type { MenuSection } from '@config/navigation';
import { ForsaSidebar } from './components/ForsaSidebar';
import { useSidebarMode } from '@core/hooks/useSidebarMode';

const SIDEBAR_COLLAPSED_KEY = 'forsa-sidebar-collapsed';
const sidebarCollapseListeners = new Set<() => void>();

function readCollapsedFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

function emitSidebarCollapseChange() {
  sidebarCollapseListeners.forEach(fn => fn());
}

function subscribeSidebarCollapse(onChange: () => void) {
  sidebarCollapseListeners.add(onChange);
  return () => {
    sidebarCollapseListeners.delete(onChange);
  };
}

function useSidebarCollapsedFromStorage(): boolean {
  return useSyncExternalStore(subscribeSidebarCollapse, readCollapsedFromStorage, () => false);
}

interface AmberDashboardLayoutProps {
  children?: React.ReactNode;
  portalPaths?: string[];
  sidebarLoader?: (path: string, view?: string) => Promise<MenuSection[]>;
  menuSections?: MenuSection[];
  appLabel?: string;
}

export const AmberDashboardLayout: React.FC<AmberDashboardLayoutProps> = ({
  children,
  portalPaths = ['/portal', '/'],
  sidebarLoader,
  menuSections,
  appLabel,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isCollapsed = useSidebarCollapsedFromStorage();
  const { language, setLanguage, dir, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleToggleCollapse = useCallback(() => {
    const next = !readCollapsedFromStorage();
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? 'true' : 'false');
    } catch {
      /* ignore */
    }
    emitSidebarCollapseChange();
  }, []);

  const isPortalPage = portalPaths.includes(router.pathname);
  const { mode } = useSidebarMode();

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  // Prevent a stuck mobile overlay after navigation or desktop resize.
  useEffect(() => {
    closeSidebar();
  }, [router.pathname, closeSidebar]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => {
      if (window.innerWidth >= 1024) closeSidebar();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [closeSidebar]);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isSidebarOpen, closeSidebar]);

  return (
    <div className="min-h-screen flex flex-col" dir={dir} suppressHydrationWarning>
      <AmberTopbar
        onOpenSidebar={() => setIsSidebarOpen(true)}
        isPortalPage={isPortalPage}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
        t={t}
        dir={dir}
        appLabel={appLabel}
        showServices={mode !== 'unified'}
        sidebarInsetClassName={isPortalPage ? '' : isCollapsed ? 'lg:ps-20' : 'lg:ps-64'}
      />
      <div className="flex flex-1 relative min-h-0 overflow-x-hidden">
        {!isPortalPage && isSidebarOpen && (
          <div
            className="fixed inset-0 z-[105] bg-black/30 lg:hidden"
            role="presentation"
            aria-hidden="true"
            onClick={closeSidebar}
          />
        )}
        {!isPortalPage && (
          <ForsaSidebar
            isOpen={isSidebarOpen}
            isCollapsed={isCollapsed}
            onToggleCollapse={handleToggleCollapse}
            onClose={closeSidebar}
            sidebarLoader={sidebarLoader}
            menuSections={menuSections}
            appLabel={appLabel}
            sidebarMode={mode}
          />
        )}
        <main
          className={`flex-1 overflow-y-auto scroll-smooth transition-all duration-300 ${
            isPortalPage ? '' : isCollapsed ? 'lg:ps-20' : 'lg:ps-64'
          }`}
        >
          <div className="max-w-[1600px] mx-auto p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
