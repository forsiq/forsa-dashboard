
import { 
  LayoutGrid, 
  Package, 
  Users, 
  ShoppingCart, 
  FileText, 
  Settings, 
  MapPin, 
  Briefcase,
  Wrench,
  CreditCard,
  Truck
} from 'lucide-react';
import { paths } from '../routes/paths';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'Page' | 'Product' | 'Customer' | 'Order' | 'Location' | 'Service';
  path: string;
  icon: any;
  keywords: string[];
}

// 1. Navigation Pages Index
const PAGES: SearchResult[] = [
  { id: 'nav-dash', title: 'Dashboard', type: 'Page', path: paths.dashboard, icon: LayoutGrid, keywords: ['home', 'main', 'analytics'] },
  { id: 'nav-cat', title: 'Master Catalog', type: 'Page', path: paths.catalog, icon: Package, keywords: ['products', 'items', 'sku'] },
  { id: 'nav-inv', title: 'Inventory Hub', type: 'Page', path: paths.inventory, icon: Truck, keywords: ['stock', 'warehouse', 'movements'] },
  { id: 'nav-ord', title: 'Order Management', type: 'Page', path: paths.orders, icon: ShoppingCart, keywords: ['sales', 'fulfillment'] },
  { id: 'nav-crm', title: 'CRM Command', type: 'Page', path: paths.crm, icon: Users, keywords: ['customers', 'leads', 'pipeline'] },
  { id: 'nav-set', title: 'System Settings', type: 'Page', path: paths.settings, icon: Settings, keywords: ['config', 'preferences', 'profile'] },
  { id: 'nav-bill', title: 'Billing & Plan', type: 'Page', path: paths.billing, icon: CreditCard, keywords: ['invoice', 'payment', 'subscription'] },
];

// 2. Mock Data Index (Simulating a database crawl)
const MOCK_DATA: SearchResult[] = [
  // Products
  { id: 'prod-1', title: 'Neural-Link Adapter', subtitle: 'SKU-8001 • Electronics', type: 'Product', path: '/catalog/product/SKU-8001', icon: Package, keywords: ['adapter', 'neural', 'electronics'] },
  { id: 'prod-2', title: 'Quantum Glass Screen', subtitle: 'SKU-8002 • Accessories', type: 'Product', path: '/catalog/product/SKU-8002', icon: Package, keywords: ['glass', 'screen', 'display'] },
  { id: 'prod-3', title: 'Haptic Gloves', subtitle: 'SKU-8003 • Wearables', type: 'Product', path: '/catalog/product/SKU-8003', icon: Package, keywords: ['gloves', 'vr', 'wearable'] },
  
  // Customers
  { id: 'cust-1', title: 'Alex Morgan', subtitle: 'Acme Corp • VIP', type: 'Customer', path: '/crm/customers/CUST-1001', icon: Users, keywords: ['alex', 'morgan', 'acme'] },
  { id: 'cust-2', title: 'Sarah Chen', subtitle: 'Globex Inc', type: 'Customer', path: '/crm/customers/CUST-1002', icon: Users, keywords: ['sarah', 'chen', 'globex'] },
  
  // Orders
  { id: 'ord-1', title: 'Order #ORD-2025-001', subtitle: 'Acme Corp • $4,290.00', type: 'Order', path: '/orders/ORD-2025-001', icon: FileText, keywords: ['order', '2025-001', 'acme'] },
  { id: 'ord-2', title: 'Order #ORD-2025-002', subtitle: 'Globex Inc • $1,150.00', type: 'Order', path: '/orders/ORD-2025-002', icon: FileText, keywords: ['order', '2025-002', 'globex'] },

  // Locations
  { id: 'loc-1', title: 'US-East Distribution', subtitle: 'New York, NY', type: 'Location', path: paths.warehouses, icon: MapPin, keywords: ['warehouse', 'east', 'ny'] },
  { id: 'loc-2', title: 'EU Central Hub', subtitle: 'Berlin, Germany', type: 'Location', path: paths.warehouses, icon: MapPin, keywords: ['warehouse', 'eu', 'berlin'] },

  // Repairs/Services
  { id: 'rep-1', title: 'Repair #REP-1024', subtitle: 'MacBook Pro • Liquid Damage', type: 'Service', path: '/repairs/REP-1024', icon: Wrench, keywords: ['repair', 'macbook', 'service'] },
];

const ALL_SEARCHABLE_ITEMS = [...PAGES, ...MOCK_DATA];

export const performGlobalSearch = (query: string): Record<string, SearchResult[]> => {
  if (!query) return {};

  const lowerQuery = query.toLowerCase();
  
  // Filter items
  const results = ALL_SEARCHABLE_ITEMS.filter(item => {
    // Direct match on title
    if (item.title.toLowerCase().includes(lowerQuery)) return true;
    // Direct match on subtitle
    if (item.subtitle && item.subtitle.toLowerCase().includes(lowerQuery)) return true;
    // Keyword match
    if (item.keywords.some(k => k.toLowerCase().includes(lowerQuery))) return true;
    
    return false;
  });

  // Group by Type
  const grouped: Record<string, SearchResult[]> = {};
  
  results.forEach(item => {
    if (!grouped[item.type]) {
      grouped[item.type] = [];
    }
    grouped[item.type].push(item);
  });

  return grouped;
};
