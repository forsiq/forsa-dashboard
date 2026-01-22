
import { 
  Database, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Package,
  Layers,
  Cpu,
  ShieldAlert,
  Terminal,
  Store,
  Zap,
  HelpCircle,
  Users
} from 'lucide-react';
import { paths } from '../routes/paths';

export interface ServiceModule {
  id: string;
  label: string;
  path: string;
  icon: any;
  description: string;
  color: string;
  category: 'core' | 'intelligence' | 'admin' | 'infrastructure';
}

export const services: ServiceModule[] = [
  // CORE SYSTEMS
  {
    id: 'catalog',
    label: 'Master Catalog',
    path: paths.catalog,
    icon: Database,
    description: 'Central SKU authority and metadata management.',
    color: '#F5C451',
    category: 'core'
  },
  {
    id: 'inventory',
    label: 'Inventory Hub',
    path: paths.inventory,
    icon: Package,
    description: 'Global stock levels and fulfillment tracking.',
    color: '#4EA1FF',
    category: 'core'
  },
  {
    id: 'orders',
    label: 'Order Management',
    path: paths.orders,
    icon: ShoppingCart,
    description: 'End-to-end B2B and D2C transaction flow.',
    color: '#45C490',
    category: 'core'
  },
  {
    id: 'admin.stores',
    label: 'Node Network',
    path: paths.adminStores,
    icon: Store,
    description: 'Manage physical branches and edge nodes.',
    color: '#EC4899',
    category: 'core'
  },

  // INTELLIGENCE
  {
    id: 'analytics',
    label: 'Analytics Hub',
    path: paths.analytics,
    icon: BarChart3,
    description: 'Real-time performance metrics and forecasting.',
    color: '#EC4899',
    category: 'intelligence'
  },
  {
    id: 'workflow',
    label: 'Automation Flow',
    path: paths.templateAutomation,
    icon: Zap,
    description: 'Intelligent logic enrichment pipelines.',
    color: '#8C5CFF',
    category: 'intelligence'
  },
  {
    id: 'audit_logs',
    label: 'Audit Vault',
    path: '/audit-logs',
    icon: ShieldAlert,
    description: 'Immutable system-wide activity logs.',
    color: '#E06C75',
    category: 'intelligence'
  },

  // INFRASTRUCTURE
  {
    id: 'compute',
    label: 'Compute Nodes',
    path: '/compute',
    icon: Cpu,
    description: 'Cloud resource allocation and health.',
    color: '#4EA1FF',
    category: 'infrastructure'
  },
  {
    id: 'terminal',
    label: 'System Terminal',
    path: '/audit-logs',
    icon: Terminal,
    description: 'Direct low-level system command access.',
    color: '#AFB5C0',
    category: 'infrastructure'
  },

  // ADMINISTRATION
  {
    id: 'admin.users',
    label: 'User Directory',
    path: paths.adminUsers,
    icon: Users,
    description: 'Manage staff accounts and permissions.',
    color: '#45C490',
    category: 'admin'
  },
  {
    id: 'settings',
    label: 'System Settings',
    path: paths.settings,
    icon: Settings,
    description: 'Configure global system preferences.',
    color: '#AFB5C0',
    category: 'admin'
  }
];
