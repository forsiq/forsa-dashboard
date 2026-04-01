/**
 * Dynamic Sidebar Loader
 *
 * Loads sidebar menus from services or features based on current route.
 * GENERAL service is the default with all menu items.
 */

import type { MenuSection } from './navigation';
import { sidebarSections as generalSidebarSections } from '@services/general/sidebar';

// The GENERAL service covers all routes by default
export const GENERAL_SERVICE = 'general';

// Additional custom services (optional, user-created later)
export const serviceRoutes: Record<string, string> = {
  // Users can add custom services here, e.g.:
  // 'my-custom-service': '/my-custom-service',
};

/**
 * Get sidebar sections based on current path
 * Returns GENERAL sidebar by default for all non-portal pages
 */
export async function getSidebarForPath(path: string): Promise<MenuSection[]> {
  // Portal has no sidebar
  if (path === '/portal' || path === '/') {
    return [];
  }

  // For everything else, use GENERAL service (the full sidebar)
  // This includes: /dashboard, /categories, /customers, /orders, /inventory, /reports, /settings, /about
  return generalSidebarSections;
}

/**
 * Get service ID from path
 */
export function getServiceIdFromPath(path: string): string | null {
  // Default to GENERAL for standard pages
  if (path !== '/portal' && path !== '/') {
    return GENERAL_SERVICE;
  }

  return null;
}

/**
 * Check if path is portal page
 */
export function isPortalPath(path: string): boolean {
  return path === '/portal' || path === '/';
}
