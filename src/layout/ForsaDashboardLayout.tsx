import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { AmberDashboardLayout } from '@core/layout/AmberDashboardLayout';
import { sidebarSections } from '@services/general/sidebar';
import { resolveIcon } from '@config/navigation';
import { useSidebarBadges } from '@core/hooks/useSidebarBadges';
import type { MenuSection } from '@config/navigation';

/** Pre-resolve all string icons to Lucide components */
const generalResolved = sidebarSections.map(s => ({
  ...s,
  items: s.items.map(item => ({ ...item, icon: resolveIcon(item.icon) })),
}));

export function ForsaDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: badges } = useSidebarBadges();

  const menuSections = useMemo<MenuSection[]>(() => {
    if (!router.isReady) return generalResolved;
    const p = router.pathname;

    if (p === '/portal' || p === '/') return [];

    // Apply badge counts to relevant items
    if (!badges) return generalResolved;

    return generalResolved.map(section => ({
      ...section,
      items: section.items.map(item => {
        let badge: string | number | undefined;
        if (item.path === '/auctions') badge = badges.activeAuctions || undefined;
        else if (item.path === '/orders') badge = badges.pendingOrders || undefined;
        else if (item.path === '/listings') badge = badges.orphanListings || undefined;
        return { ...item, badge };
      }),
    }));
  }, [router.isReady, router.pathname, badges]);

  return (
    <AmberDashboardLayout
      {...({ menuSections, appLabel: 'Forsa' } as Record<string, unknown>)}
    >
      {children}
    </AmberDashboardLayout>
  );
}
