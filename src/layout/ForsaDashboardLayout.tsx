import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { AmberDashboardLayout } from '@core/layout/AmberDashboardLayout';
import { sidebarSections as dashboardSections } from '@services/dashboard/sidebar';
import { sidebarSections as marketplaceSections } from '@services/general/sidebar';
import { sidebarSections as salesSections } from '@services/sales/sidebar';
import { sidebarSections as reportsSections } from '@services/reports/sidebar';
import { resolveIcon } from '@config/navigation';
import { useSidebarBadges } from '@core/hooks/useSidebarBadges';
import { useNavigation } from '@yousef2001/core-ui/contexts';

type SidebarView = 'dashboard' | 'marketplace' | 'sales' | 'reports';
import type { MenuSection } from '@config/navigation';

/** Pre-resolve all string icons to Lucide components */
function resolveSections(sections: MenuSection[]) {
  return sections.map(s => ({
    ...s,
    items: s.items.map(item => ({ ...item, icon: resolveIcon(item.icon) })),
  }));
}

const moduleSidebars: Record<SidebarView, MenuSection[]> = {
  dashboard: resolveSections(dashboardSections),
  marketplace: resolveSections(marketplaceSections),
  sales: resolveSections(salesSections),
  reports: resolveSections(reportsSections),
};

/** Map URL prefixes to sidebar views for auto-switching */
function getViewForPath(pathname: string): SidebarView {
  if (pathname.startsWith('/reports')) return 'reports';
  if (
    pathname.startsWith('/auctions') ||
    pathname.startsWith('/listings') ||
    pathname.startsWith('/amazon-import') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/group-buying') ||
    pathname.startsWith('/inventory')
  ) return 'marketplace';
  if (
    pathname.startsWith('/orders') ||
    pathname.startsWith('/customers')
  ) return 'sales';
  return 'dashboard';
}

export function ForsaDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: badges } = useSidebarBadges();
  const { sidebarView } = useNavigation();

  const menuSections = useMemo<MenuSection[]>(() => {
    if (!router.isReady) {
      return moduleSidebars[sidebarView] || moduleSidebars.dashboard;
    }
    const p = router.pathname;

    if (p === '/portal' || p === '/') return [];

    // Determine which sidebar to show based on URL + sidebarView
    const urlView = getViewForPath(p);
    const activeView = urlView || sidebarView;
    const baseSections = moduleSidebars[activeView] || moduleSidebars.dashboard;

    // Apply badge counts to relevant items
    if (!badges) return baseSections;

    return baseSections.map(section => ({
      ...section,
      items: section.items.map(item => {
        let badge: string | number | undefined;
        if (item.path === '/auctions') badge = badges.activeAuctions || undefined;
        else if (item.path === '/orders') badge = badges.pendingOrders || undefined;
        else if (item.path === '/listings') badge = badges.totalListings || undefined;
        return { ...item, badge };
      }),
    }));
  }, [router.isReady, router.pathname, badges, sidebarView]);

  return (
    <AmberDashboardLayout menuSections={menuSections} appLabel="Forsa">
      {children}
    </AmberDashboardLayout>
  );
}
