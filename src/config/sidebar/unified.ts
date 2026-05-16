/**
 * Unified sidebar config — merges all module sidebars into one flat list
 * with collapsible module headers. Used when `sidebarMode === 'unified'`.
 */

import type { MenuSection } from '@config/navigation';
import { sidebarSections as dashboardSections } from './dashboard';
import { sidebarSections as marketplaceSections } from './marketplace';
import { sidebarSections as salesSections } from './sales';
import { sidebarSections as reportsSections } from './reports';
import {
  applySidebarBadges,
  type SidebarModuleView,
} from './applySidebarBadges';
import type { SidebarBadgeCounts } from '@core/hooks/useSidebarBadges';

interface ModuleDefinition {
  id: SidebarModuleView;
  title: string;
  icon: string;
  color: string;
  sections: MenuSection[];
}

const MODULE_ORDER: ModuleDefinition[] = [
  {
    id: 'dashboard',
    title: 'sidebar.module.dashboard',
    icon: 'LayoutDashboard',
    color: 'from-purple-500 to-purple-600',
    sections: dashboardSections,
  },
  {
    id: 'marketplace',
    title: 'sidebar.module.marketplace',
    icon: 'ShoppingBag',
    color: 'from-blue-500 to-blue-600',
    sections: marketplaceSections,
  },
  {
    id: 'sales',
    title: 'sidebar.module.sales',
    icon: 'ShoppingCart',
    color: 'from-amber-500 to-amber-600',
    sections: salesSections,
  },
  {
    id: 'reports',
    title: 'sidebar.module.reports',
    icon: 'BarChart3',
    color: 'from-emerald-500 to-emerald-600',
    sections: reportsSections,
  },
];

export interface UnifiedModuleHeader extends MenuSection {
  moduleId: string;
  moduleColor: string;
  moduleIcon: string;
  isModuleHeader: true;
}

export function getUnifiedSidebarSections(
  badges?: SidebarBadgeCounts,
  isNewFeature?: (path: string) => boolean,
): MenuSection[] {
  const result: MenuSection[] = [];

  for (const mod of MODULE_ORDER) {
    const header: UnifiedModuleHeader = {
      title: mod.title,
      items: [],
      moduleId: mod.id,
      moduleColor: mod.color,
      moduleIcon: mod.icon,
      isModuleHeader: true,
    };
    result.push(header);

    const badgedSections = applySidebarBadges(mod.id, mod.sections, badges, isNewFeature);
    for (const section of badgedSections) {
      result.push({
        ...section,
        moduleId: mod.id,
      });
    }
  }

  return result;
}
