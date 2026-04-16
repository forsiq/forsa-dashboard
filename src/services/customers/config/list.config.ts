import type { ColumnConfig } from '@core/services/types';

export const customerListColumns: ColumnConfig[] = [
  { key: 'name', label: 'customer.name', sortable: true, align: 'left' },
  { key: 'email', label: 'customer.email', sortable: true, align: 'left' },
  { key: 'phone', label: 'customer.phone', sortable: false, align: 'left' },
  { key: 'status', label: 'customer.status', sortable: true, align: 'center', type: 'status' },
  { key: 'type', label: 'customer.type', sortable: true, align: 'center' },
];

export const customerFilterConfig = {
  statusOptions: [
    { label: 'customer.all', value: 'all' },
    { label: 'customer.active', value: 'active' },
    { label: 'customer.inactive', value: 'inactive' },
    { label: 'customer.blocked', value: 'blocked' },
  ],
  typeOptions: [
    { label: 'customer.all', value: 'all' },
    { label: 'customer.individual', value: 'individual' },
    { label: 'customer.business', value: 'business' },
  ],
  availableFilters: ['search', 'status', 'type'] as const,
  defaultFilters: { status: 'all' as const, type: 'all' as const },
};

export const customerListConfig = {
  columns: customerListColumns,
  filters: customerFilterConfig,
  defaultSort: { field: 'name', order: 'asc' as const },
  pageSize: 20,
  features: { rowActions: true, selection: true, pagination: true },
  rowActions: { edit: true, delete: true, view: true },
};
