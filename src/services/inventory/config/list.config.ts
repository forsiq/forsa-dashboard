import type { ColumnConfig } from '@core/services/types';

export const inventoryListColumns: ColumnConfig[] = [
  { key: 'name', label: 'product.name', sortable: true, align: 'left' },
  { key: 'sku', label: 'product.sku', sortable: true, align: 'left' },
  { key: 'price', label: 'product.price', sortable: true, align: 'center' },
  { key: 'quantity', label: 'product.quantity', sortable: true, align: 'center' },
  { key: 'status', label: 'product.status', sortable: true, align: 'center', type: 'status' },
];

export const inventoryFilterConfig = {
  statusOptions: [
    { label: 'common.all', value: 'all' },
    { label: 'product.active', value: 'active' },
    { label: 'product.inactive', value: 'inactive' },
    { label: 'product.discontinued', value: 'discontinued' },
  ],
  availableFilters: ['search', 'category', 'status'] as const,
  defaultFilters: { status: 'all' as const },
};

export const inventoryListConfig = {
  columns: inventoryListColumns,
  filters: inventoryFilterConfig,
  defaultSort: { field: 'name', order: 'asc' as const },
  pageSize: 20,
  features: { rowActions: true, selection: true, pagination: true },
  rowActions: { edit: true, delete: true, view: true },
};
