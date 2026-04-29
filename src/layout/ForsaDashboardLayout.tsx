import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { AmberDashboardLayout } from '@core/layout/AmberDashboardLayout';
import { sidebarSections } from '@services/general/sidebar';
import { resolveIcon } from '@config/navigation';
import type { MenuSection } from '@config/navigation';

/** Pre-resolve all string icons to Lucide components */
const generalResolved = sidebarSections.map(s => ({
  ...s,
  items: s.items.map(item => ({ ...item, icon: resolveIcon(item.icon) })),
}));

export function ForsaDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const menuSections = useMemo<MenuSection[]>(() => {
    if (!router.isReady) return generalResolved;
    const p = router.pathname;

    if (p === '/portal' || p === '/') return [];

    return generalResolved;
  }, [router.isReady, router.pathname]);

  return (
    <AmberDashboardLayout
      {...({ menuSections } as Record<string, unknown>)}
    >
      {children}
    </AmberDashboardLayout>
  );
}
