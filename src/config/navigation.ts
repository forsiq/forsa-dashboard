/**
 * Navigation types and icon resolution for the sidebar.
 * Menu structure lives in `src/config/sidebar/*.ts` (per topbar module).
 */

import * as Icons from 'lucide-react';

export type IconInput = React.ComponentType<{ className?: string }> | string;

export interface MenuItem {
  path: string;
  label: string;
  icon: IconInput;
  badge?: string | number;
  serviceId?: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
  /** Module identifier for unified sidebar mode (e.g. 'dashboard', 'marketplace') */
  moduleId?: string;
  /** Tailwind gradient class for the module accent border */
  moduleColor?: string;
  /** When true, this section acts as a collapsible module header in unified mode */
  isModuleHeader?: boolean;
}

/**
 * Resolve icon from string name to component
 */
export const resolveIcon = (icon: IconInput): React.ComponentType<{ className?: string }> => {
  if (typeof icon === 'string') {
    const iconKey = icon as keyof typeof Icons;
    return (Icons[iconKey] as React.ComponentType<{ className?: string }>) || Icons.Circle;
  }
  return icon;
};
