import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { AmberDashboardLayout } from '@core/layout/AmberDashboardLayout';
import { getViewFromPath } from '@config/sidebarLoader';
import { sidebarSections } from '@services/general/sidebar';
import { resolveIcon } from '@config/navigation';
import type { MenuSection } from '@config/navigation';

/** Pre-resolve all string icons to Lucide components (menuSections path bypasses resolveIcon). */
const generalResolved = sidebarSections.map(s => ({
  ...s,
  items: s.items.map(item => ({ ...item, icon: resolveIcon(item.icon) })),
}));

const reportsResolved = generalResolved.filter(s => s.title === 'sidebar.reports');

/**
 * Wraps AmberDashboardLayout: passes sync menuSections so the sidebar always has items.
 *
 * NOTE: The published @yousef2001/core-ui types (dist/*.d.ts) don't expose
 * sidebarLoader / menuSections in AmberDashboardLayoutProps, even though the
 * runtime JS in dist/layout/AmberDashboardLayout.js accepts and forwards them.
 * We use a type-assertion to bridge this gap until a new core-ui version is published.
 */
export function ForsaDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const menuSections = useMemo<MenuSection[]>(() => {
    if (!router.isReady) return generalResolved;
    const p = router.pathname;

    if (p === '/portal' || p === '/') return [];

    const view = getViewFromPath(p);
    return view === 'reports' ? reportsResolved : generalResolved;
  }, [router.isReady, router.pathname]);

  return (
    <AmberDashboardLayout
      {...({ menuSections } as Record<string, unknown>)}
    >
      {children}
    </AmberDashboardLayout>
  );
}
