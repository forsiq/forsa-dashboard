export interface StatCard {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: 'brand' | 'info' | 'success' | 'warning' | 'danger';
}

export interface ActivityItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  description?: string;
  timestamp: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  color?: 'brand' | 'info' | 'success' | 'warning' | 'danger';
}
