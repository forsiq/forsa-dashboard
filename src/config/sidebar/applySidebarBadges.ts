/**
 * Maps `useSidebarBadges` counts onto nav items only for the active topbar module,
 * so we do not attach auction/listing/order badges while rendering e.g. Reports.
 */

import type { MenuSection } from '@config/navigation';
import type { SidebarBadgeCounts } from '@core/hooks/useSidebarBadges';
import { getNavPathBase } from '@core/utils/isNavItemActive';

export type SidebarModuleView = 'dashboard' | 'marketplace' | 'sales' | 'reports';

const BADGE_BY_BASE_PATH: Partial<
  Record<SidebarModuleView, Partial<Record<string, keyof SidebarBadgeCounts>>>
> = {
  dashboard: {},
  marketplace: {
    '/auctions': 'activeAuctions',
    '/listings': 'totalListings',
    '/group-buying': 'totalGroupBuyings',
  },
  sales: {
    '/orders': 'pendingOrders',
  },
  reports: {},
};

function countToBadge(value: number | undefined): string | number | undefined {
  if (value === undefined || value === null || value <= 0) return undefined;
  return value;
}

export function applySidebarBadges(
  view: SidebarModuleView,
  sections: MenuSection[],
  badges: SidebarBadgeCounts | undefined,
): MenuSection[] {
  if (!badges) return sections;

  const pathMap = BADGE_BY_BASE_PATH[view];
  if (!pathMap || Object.keys(pathMap).length === 0) return sections;

  return sections.map(section => ({
    ...section,
    items: section.items.map(item => {
      const base = getNavPathBase(item.path);
      const key = pathMap[base];
      if (!key) return item;
      return { ...item, badge: countToBadge(badges[key]) };
    }),
  }));
}
