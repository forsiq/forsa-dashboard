/**
 * Dynamic Sidebar Loader
 *
 * Loads sidebar menus from services or features based on current route.
 * GENERAL service is the default with all menu items.
 * Automatically detects sidebar view from the current path:
 * - /reports/* → shows only reports section
 * - everything else → shows all sections except reports
 */

import type { MenuSection } from './navigation';
import { sidebarSections as generalSidebarSections } from '@services/general/sidebar';

// The GENERAL service covers all routes by default
export const GENERAL_SERVICE = 'general';

export type SidebarView = 'general' | 'reports';

// Map of path prefixes to their sidebar view
const PATH_VIEW_MAP: Record<string, SidebarView> = {
  '/reports': 'reports',
};

/**
 * Detect sidebar view from the current path
 */
export function getViewFromPath(path: string): SidebarView {
  for (const [prefix, view] of Object.entries(PATH_VIEW_MAP)) {
    if (path === prefix || path.startsWith(prefix + '/')) {
      return view;
    }
  }
  return 'general';
}

/**
 * Get sidebar sections based on current path
 * Uses path-based detection to determine which sections to show,
 * regardless of the sidebarView parameter from context.
 */
export async function getSidebarForPath(path: string, _sidebarView?: SidebarView): Promise<MenuSection[]> {
  // Portal has no sidebar
  if (path === '/portal' || path === '/') {
    return [];
  }

  // Always detect view from path - this ensures sidebar follows the route
  const effectiveView = getViewFromPath(path);

  if (effectiveView === 'reports') {
    return generalSidebarSections.filter(s => s.title === 'sidebar.reports');
  }

  // General view: exclude reports section
  return generalSidebarSections.filter(s => s.title !== 'sidebar.reports');
}

/**
 * Get service ID from path
 */
export function getServiceIdFromPath(path: string): string {
  if (path !== '/portal' && path !== '/') {
    return GENERAL_SERVICE;
  }
  return '';
}

/**
 * Check if path is portal page
 */
export function isPortalPath(path: string): boolean {
  return path === '/portal' || path === '/';
}
