
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
  bg: string;
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
    color: 'text-brand',
    bg: 'bg-brand/10',
    category: 'core'
  },
  {
    id: 'inventory',
    label: 'Inventory Hub',
    path: paths.inventory,
    icon: Package,
    description: 'Global stock levels and fulfillment tracking.',
    color: 'text-info',
    bg: 'bg-info/10',
    category: 'core'
  },
  {
    id: 'orders',
    label: 'Order Management',
    path: paths.orders,
    icon: ShoppingCart,
    description: 'End-to-end B2B and D2C transaction flow.',
    color: 'text-success',
    bg: 'bg-success/10',
    category: 'core'
  },
  {
    id: 'admin.stores',
    label: 'Node Network',
    path: paths.adminStores,
    icon: Store,
    description: 'Manage physical branches and edge nodes.',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    category: 'core'
  },

  // INTELLIGENCE
  {
    id: 'analytics',
    label: 'Analytics Hub',
    path: paths.analytics,
    icon: BarChart3,
    description: 'Real-time performance metrics and forecasting.',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    category: 'intelligence'
  },
  {
    id: 'workflow',
    label: 'Automation Flow',
    path: paths.templateAutomation,
    icon: Zap,
    description: 'Intelligent logic enrichment pipelines.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    category: 'intelligence'
  },
  {
    id: 'audit_logs',
    label: 'Audit Vault',
    path: '/audit-logs',
    icon: ShieldAlert,
    description: 'Immutable system-wide activity logs.',
    color: 'text-danger',
    bg: 'bg-danger/10',
    category: 'intelligence'
  },

  // INFRASTRUCTURE
  {
    id: 'compute',
    label: 'Compute Nodes',
    path: '/compute',
    icon: Cpu,
    description: 'Cloud resource allocation and health.',
    color: 'text-info',
    bg: 'bg-info/10',
    category: 'infrastructure'
  },
  {
    id: 'terminal',
    label: 'System Terminal',
    path: '/audit-logs',
    icon: Terminal,
    description: 'Direct low-level system command access.',
    color: 'text-zinc-400',
    bg: 'bg-white/5',
    category: 'infrastructure'
  },

  // ADMINISTRATION
  {
    id: 'admin.users',
    label: 'User Directory',
    path: paths.adminUsers,
    icon: Users,
    description: 'Manage staff accounts and permissions.',
    color: 'text-success',
    bg: 'bg-success/10',
    category: 'admin'
  },
  {
    id: 'settings',
    label: 'System Settings',
    path: paths.settings,
    icon: Settings,
    description: 'Configure global system preferences.',
    color: 'text-zinc-400',
    bg: 'bg-white/5',
    category: 'admin'
  }
];
