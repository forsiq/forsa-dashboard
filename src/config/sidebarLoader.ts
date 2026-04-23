/**
 * Dynamic Sidebar Loader
 *
 * Loads sidebar menus from services or features based on current route.
 * GENERAL service is the default with all menu items.
 * Supports sidebarView: 'general' (excludes reports) or 'reports' (only reports).
 */

import type { MenuSection } from './navigation';
import { sidebarSections as generalSidebarSections } from '@services/general/sidebar';

// The GENERAL service covers all routes by default
export const GENERAL_SERVICE = 'general';

export type SidebarView = 'general' | 'reports';

// Additional custom services (optional, user-created later)
export const serviceRoutes: Record<string, string> = {
  // Users can add custom services here, e.g.:
  // 'my-custom-service': '/my-custom-service',
};

/**
 * Get sidebar sections based on current path and view mode
 * - 'general': All sections EXCEPT reports
 * - 'reports': Only the reports section
 */
export async function getSidebarForPath(path: string, sidebarView: SidebarView = 'general'): Promise<MenuSection[]> {
  // Portal has no sidebar
  if (path === '/portal' || path === '/') {
    return [];
  }

  if (sidebarView === 'reports') {
    return generalSidebarSections.filter(s => s.title === 'sidebar.reports');
  }

  // General view: exclude reports section
  return generalSidebarSections.filter(s => s.title !== 'sidebar.reports');
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
