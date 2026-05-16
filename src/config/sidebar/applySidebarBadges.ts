/**
 * Maps `useSidebarBadges` counts onto nav items only for the active topbar module,
 * so we do not attach auction/listing/order badges while rendering e.g. Reports.
 * Also applies "NEW" changelog badges to items with recent unseen entries.
 */

import type { MenuSection } from '@config/navigation';
import type { SidebarBadgeCounts } from '@core/hooks/useSidebarBadges';
import { getNavPathBase } from '@core/utils/isNavItemActive';

export type SidebarModuleView = 'dashboard' | 'marketplace' | 'sales' | 'reports';

/** Sentinel value for changelog "new feature" badges — translate at render time via `sidebar.badge.new`. */
export const CHANGELOG_NEW_BADGE = '__changelog_new__';

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
  isNewFeature?: (path: string) => boolean,
): MenuSection[] {
  const pathMap = BADGE_BY_BASE_PATH[view];
  const hasCountMap = pathMap && Object.keys(pathMap).length > 0;
  const hasChangelog = !!isNewFeature;

  if (!badges && !hasChangelog) return sections;
  if (!hasCountMap && !hasChangelog) return sections;

  return sections.map(section => ({
    ...section,
    items: section.items.map(item => {
      const base = getNavPathBase(item.path);

      const countBadge = hasCountMap && badges
        ? countToBadge(pathMap![base] ? badges[pathMap![base]] : undefined)
        : undefined;

      const changelogBadge =
        hasChangelog && isNewFeature!(item.path) ? CHANGELOG_NEW_BADGE : undefined;

      // Numeric count badge takes priority over "NEW" string badge
      const badge = countBadge ?? changelogBadge;

      if (badge === undefined) return item;
      return { ...item, badge };
    }),
  }));
}
