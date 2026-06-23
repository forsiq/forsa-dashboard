/**
 * Maps `useSidebarBadges` counts onto nav items only for the active topbar module,
 * so we do not attach auction/listing/order badges while rendering e.g. Reports.
 * Also applies "NEW" changelog badges to items with recent unseen entries.
 */

import type { MenuSection } from '@config/navigation';
import type { SidebarBadgeCounts } from '@core/hooks/useSidebarBadges';
import { getNavPathBase } from '@core/utils/isNavItemActive';

export type SidebarModuleView = 'dashboard' | 'marketplace' | 'sales' | 'reports' | 'feedback';

/** Sentinel value for changelog "new feature" badges — translate at render time via `sidebar.badge.new`. */
export const CHANGELOG_NEW_BADGE = '__changelog_new__';

/** Full href including query — checked before base path (e.g. pending orders tab only). */
const BADGE_BY_EXACT_PATH: Partial<
  Record<SidebarModuleView, Partial<Record<string, keyof SidebarBadgeCounts>>>
> = {
  sales: {
    '/orders?status=pending': 'pendingOrders',
  },
};

const BADGE_BY_BASE_PATH: Partial<
  Record<SidebarModuleView, Partial<Record<string, keyof SidebarBadgeCounts>>>
> = {
  dashboard: {},
  marketplace: {
    '/auctions': 'activeAuctions',
    '/listings': 'totalListings',
    '/group-buying': 'totalGroupBuyings',
  },
  sales: {},
  reports: {},
  feedback: {},
};

function resolveCountBadge(
  view: SidebarModuleView,
  itemPath: string,
  badges: SidebarBadgeCounts,
): string | number | undefined {
  const exactKey = BADGE_BY_EXACT_PATH[view]?.[itemPath];
  if (exactKey) return countToBadge(badges[exactKey]);

  const base = getNavPathBase(itemPath);
  const baseKey = BADGE_BY_BASE_PATH[view]?.[base];
  if (!baseKey) return undefined;
  return countToBadge(badges[baseKey]);
}

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
  const hasBaseBadges =
    !!BADGE_BY_BASE_PATH[view] && Object.keys(BADGE_BY_BASE_PATH[view]!).length > 0;
  const hasExactBadges =
    !!BADGE_BY_EXACT_PATH[view] && Object.keys(BADGE_BY_EXACT_PATH[view]!).length > 0;
  const hasCountMap = hasBaseBadges || hasExactBadges;
  const hasChangelog = !!isNewFeature;

  if (!badges && !hasChangelog) return sections;
  if (!hasCountMap && !hasChangelog) return sections;

  return sections.map(section => ({
    ...section,
    items: section.items.map(item => {
      const countBadge =
        hasCountMap && badges ? resolveCountBadge(view, item.path, badges) : undefined;

      const changelogBadge =
        hasChangelog && isNewFeature!(item.path) ? CHANGELOG_NEW_BADGE : undefined;

      // Numeric count badge takes priority over "NEW" string badge
      const badge = countBadge ?? changelogBadge;

      if (badge === undefined) return item;
      return { ...item, badge };
    }),
  }));
}
