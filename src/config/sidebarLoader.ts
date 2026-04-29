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

export type SidebarView = 'general';

/**
 * Get sidebar sections based on current path
 */
export async function getSidebarForPath(path: string, _sidebarView?: SidebarView): Promise<MenuSection[]> {
  // Portal has no sidebar
  if (path === '/portal' || path === '/') {
    return [];
  }

  return generalSidebarSections;
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
