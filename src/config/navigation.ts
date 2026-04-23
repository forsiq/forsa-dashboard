/**
 * Navigation Menu Configuration
 *
 * This file defines the sidebar menu structure.
 * Each menu item can optionally link to a service.
 *
 * DEVELOPERS: Add menu items here. DO NOT modify the Sidebar component.
 */

import * as Icons from 'lucide-react';

// Icon type - either a Lucide icon component or string name to resolve
export type IconInput = React.ComponentType<{ className?: string }> | string;

export interface MenuItem {
  path: string;
  label: string;
  icon: IconInput;
  badge?: string | number;
  serviceId?: string;  // Links to service ID from services.ts
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

/**
 * Resolve icon from string name to component
 */
export const resolveIcon = (icon: IconInput): React.ComponentType<{ className?: string }> => {
  if (typeof icon === 'string') {
    const iconKey = icon as keyof typeof Icons;
    return Icons[iconKey] as React.ComponentType<{ className?: string }> || Icons.Circle;
  }
  return icon;
};

/**
 * Default menu sections for the sidebar
 * Icons can be specified as strings (e.g., 'Activity') or direct imports from lucide-react
 */
export const menuSections: MenuSection[] = [
  {
    title: 'sidebar.dashboards',
    items: [
      {
        path: '/dashboard',
        label: 'sidebar.dashboard',
        icon: 'Activity',
        serviceId: 'dashboard',
      },
      {
        path: '/live-monitor',
        label: 'sidebar.live_monitor',
        icon: 'Radio',
      },
    ],
  },
  {
    title: 'sidebar.operations',
    items: [
      {
        path: '/settlements',
        label: 'sidebar.settlements',
        icon: 'Landmark',
      },
      {
        path: '/moderation',
        label: 'sidebar.moderation',
        icon: 'Shield',
      },
    ],
  },
  {
    title: 'sidebar.auctions',
    items: [
      {
        path: '/auctions',
        label: 'auction.title',
        icon: 'Gavel',
        serviceId: 'auctions',
      },
      {
        path: '/auctions/add',
        label: 'auction.create',
        icon: 'PlusCircle',
      },
      {
        path: '/my-bids',
        label: 'auction.bids',
        icon: 'Hammer',
      },
    ],
  },
  {
    title: 'sidebar.catalog',
    items: [
      {
        path: '/categories',
        label: 'category.title',
        icon: 'FolderTree',
        serviceId: 'categories',
      },
    ],
  },
  {
    title: 'sidebar.sales',
    items: [
      {
        path: '/orders',
        label: 'order.title',
        icon: 'ShoppingCart',
        serviceId: 'orders',
      },
      {
        path: '/group-buying',
        label: 'auction.group_buying',
        icon: 'Users',
        serviceId: 'sales',
      },
    ],
  },
  {
    title: 'sidebar.customers',
    items: [
      {
        path: '/customers',
        label: 'customer.title',
        icon: 'UserCircle',
        serviceId: 'customers',
      },
    ],
  },
  {
    title: 'sidebar.users',
    items: [
      {
        path: '/users',
        label: 'user.title',
        icon: 'Users',
      },
    ],
  },
  {
    title: 'sidebar.reports',
    items: [
      {
        path: '/reports',
        label: 'report.dashboard',
        icon: 'BarChart3',
        serviceId: 'reports',
      },
      {
        path: '/reports/analytics',
        label: 'report.analytics',
        icon: 'TrendingUp',
      },
      {
        path: '/reports/sales',
        label: 'report.sales',
        icon: 'FileText',
      },
    ],
  },
  {
    title: 'sidebar.general',
    items: [
      {
        path: '/settings',
        label: 'settings.page.title',
        icon: 'Settings',
      },
      {
        path: '/about',
        label: 'sidebar.about',
        icon: 'Info',
      },
    ],
  },
];

/**
 * Get menu sections with resolved icons
 */
export const getMenuSectionsWithResolvedIcons = (t: (key: string) => string): MenuSection[] => {
  return menuSections.map(section => ({
    ...section,
    title: t(section.title) || section.title,
    items: section.items.map(item => ({
      ...item,
      label: t(item.label) || item.label,
      icon: resolveIcon(item.icon),
    })),
  }));
};

/**
 * Get menu sections for a specific service
 */
export const getMenuForService = (serviceId: string): MenuSection[] => {
  return menuSections
    .map(section => ({
      title: section.title,
      items: section.items.filter(item => item.serviceId === serviceId),
    }))
    .filter(section => section.items.length > 0);
};

/**
 * Get all menu items as a flat array
 */
export const getAllMenuItems = (): MenuItem[] => {
  return menuSections.flatMap(section => section.items);
};

/**
 * Find menu item by path
 */
export const getMenuItemByPath = (path: string): MenuItem | undefined => {
  return getAllMenuItems().find(item => item.path === path);
};
