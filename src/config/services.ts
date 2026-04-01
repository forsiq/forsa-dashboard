/**
 * Service Registry Configuration
 *
 * This file defines all available services in the application.
 * Services can be internal (within this app) or external (separate apps).
 *
 * DEVELOPERS: Add new services here and update config/navigation.ts for menu items.
 */

import * as Icons from 'lucide-react';

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string | React.ComponentType<{ className?: string }>;
  type: 'internal' | 'external';
  url?: string;
  route?: string;
  enabled: boolean;
  color?: string;
  badge?: string;
}

/**
 * All available services
 *
 * GENERAL is the main service with full sidebar (Dashboard, Categories, Inventory, etc.)
 * Additional services can be added as custom modules.
 */
export const services: Service[] = [
  // Main Service
  {
    id: 'general',
    name: 'General',
    description: 'service.general.description',
    icon: 'LayoutDashboard',
    type: 'internal',
    route: '/dashboard',
    enabled: true,
    color: 'from-purple-500 to-purple-600',
  },

  // External Services (Separate Apps) - add as needed
  {
    id: 'products',
    name: 'ProductSuite',
    description: 'products.description',
    icon: 'Box',
    type: 'external',
    url: 'http://localhost:3002',
    enabled: false,  // Disabled by default - enable when needed
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    id: 'debt-pro',
    name: 'DebtPro',
    description: 'debt.description',
    icon: 'DollarSign',
    type: 'external',
    url: 'http://localhost:3005',
    enabled: false,
    color: 'from-red-500 to-red-600',
  },
];

/**
 * Resolve icon from string name to component
 */
export const resolveServiceIcon = (icon: string | React.ComponentType<{ className?: string }>): React.ComponentType<{ className?: string }> => {
  if (typeof icon === 'string') {
    const iconKey = icon as keyof typeof Icons;
    return Icons[iconKey] as React.ComponentType<{ className?: string }> || Icons.Circle;
  }
  return icon;
};

/**
 * Get enabled services only
 */
export const getEnabledServices = (): Service[] => {
  return services.filter(s => s.enabled);
};

/**
 * Get service by ID
 */
export const getServiceById = (id: string): Service | undefined => {
  return services.find(s => s.id === id);
};

/**
 * Get internal services only
 */
export const getInternalServices = (): Service[] => {
  return services.filter(s => s.type === 'internal' && s.enabled);
};

/**
 * Get external services only
 */
export const getExternalServices = (): Service[] => {
  return services.filter(s => s.type === 'external' && s.enabled);
};

/**
 * Format for Topbar QuickApp interface
 */
export interface QuickApp {
  id: string;
  name: string;
  url: string;
  icon: any;
  color: string;
  bg: string;
}

/**
 * Get services formatted for Topbar component
 */
export const getServicesForTopbar = (t: (key: string) => string): QuickApp[] => {
  return getEnabledServices().map(service => {
    const icon = resolveServiceIcon(service.icon);
    const color = service.color?.includes('purple') ? 'text-purple-500' :
                  service.color?.includes('blue') ? 'text-brand' :
                  service.color?.includes('amber') ? 'text-amber-500' :
                  service.color?.includes('emerald') ? 'text-emerald-500' :
                  service.color?.includes('cyan') ? 'text-cyan-500' :
                  service.color?.includes('orange') ? 'text-orange-500' :
                  service.color?.includes('rose') ? 'text-rose-500' :
                  service.color?.includes('indigo') ? 'text-indigo-500' :
                  service.color?.includes('red') ? 'text-red-500' :
                  'text-info';

    const bg = service.color?.includes('purple') ? 'bg-purple-500/10' :
               service.color?.includes('blue') ? 'bg-brand/10' :
               service.color?.includes('amber') ? 'bg-amber-500/10' :
               service.color?.includes('emerald') ? 'bg-emerald-500/10' :
               service.color?.includes('cyan') ? 'bg-cyan-500/10' :
               service.color?.includes('orange') ? 'bg-orange-500/10' :
               service.color?.includes('rose') ? 'bg-rose-500/10' :
               service.color?.includes('indigo') ? 'bg-indigo-500/10' :
               service.color?.includes('red') ? 'bg-red-500/10' :
               'bg-info/10';

    return {
      id: service.id,
      name: t(`service.${service.id}.name`) || service.name,
      url: service.type === 'external' ? (service.url || '/') : (service.route || '/'),
      icon,
      color,
      bg,
    };
  });
};
