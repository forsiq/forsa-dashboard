import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { AmberDashboardLayout } from '@core/layout/AmberDashboardLayout';
import { sidebarSections as dashboardSections } from '@config/sidebar/dashboard';
import { sidebarSections as marketplaceSections } from '@config/sidebar/marketplace';
import { sidebarSections as salesSections } from '@config/sidebar/sales';
import { sidebarSections as reportsSections } from '@config/sidebar/reports';
import {
  applySidebarBadges,
  type SidebarModuleView,
} from '@config/sidebar/applySidebarBadges';
import { getUnifiedSidebarSections } from '@config/sidebar/unified';
import { resolveIcon } from '@config/navigation';
import { useSidebarBadges } from '@core/hooks/useSidebarBadges';
import { useSidebarMode } from '@core/hooks/useSidebarMode';
import { useChangelog } from '@features/changelog/hooks/useChangelog';
import { useNavigation } from '@yousef2001/core-ui/contexts';
import type { MenuSection } from '@config/navigation';

/** Pre-resolve all string icons to Lucide components */
function resolveSections(sections: MenuSection[]) {
  return sections.map(s => ({
    ...s,
    items: s.items.map(item => ({ ...item, icon: resolveIcon(item.icon) })),
  }));
}

const moduleSidebars: Record<SidebarModuleView, MenuSection[]> = {
  dashboard: resolveSections(dashboardSections),
  marketplace: resolveSections(marketplaceSections),
  sales: resolveSections(salesSections),
  reports: resolveSections(reportsSections),
};

/** Map URL prefixes to sidebar views for auto-switching */
function getViewForPath(pathname: string): SidebarModuleView {
  if (pathname.startsWith('/reports')) return 'reports';
  if (
    pathname.startsWith('/auctions') ||
    pathname.startsWith('/listings') ||
    pathname.startsWith('/amazon-import') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/group-buying') ||
    pathname.startsWith('/inventory') ||
    pathname.startsWith('/watchlist')
  )
    return 'marketplace';
  if (pathname.startsWith('/orders') || pathname.startsWith('/customers')) return 'sales';
  return 'dashboard';
}

export function ForsaDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: badges } = useSidebarBadges();
  const { sidebarView } = useNavigation();
  const { isNewFeature } = useChangelog();
  const { mode } = useSidebarMode();

  const menuSections = useMemo<MenuSection[]>(() => {
    if (!router.isReady) {
      if (mode === 'unified') {
        return resolveSections(getUnifiedSidebarSections(badges, isNewFeature));
      }
      return moduleSidebars[sidebarView as SidebarModuleView] || moduleSidebars.dashboard;
    }
    const p = router.pathname;

    if (p === '/portal' || p === '/') return [];

    if (mode === 'unified') {
      return resolveSections(getUnifiedSidebarSections(badges, isNewFeature));
    }

    const urlView = getViewForPath(p);
    const activeView = urlView || (sidebarView as SidebarModuleView);
    const baseSections = moduleSidebars[activeView] || moduleSidebars.dashboard;

    return applySidebarBadges(activeView, baseSections, badges, isNewFeature);
  }, [router.isReady, router.pathname, badges, sidebarView, isNewFeature, mode]);

  return (
    <AmberDashboardLayout menuSections={menuSections} appLabel="Forsa">
      <div className="relative min-h-[50vh]">
        {children}
      </div>
    </AmberDashboardLayout>
  );
}
