import type { ColumnConfig } from '@core/services/types';

export const reportListColumns: ColumnConfig[] = [
  { key: 'name', label: 'report.name', sortable: true, align: 'left' },
  { key: 'type', label: 'report.type', sortable: true, align: 'center' },
  { key: 'description', label: 'report.description', sortable: false, align: 'left' },
];

export const reportFilterConfig = {
  typeOptions: [
    { label: 'common.all', value: 'all' },
    { label: 'report.sales', value: 'sales' },
    { label: 'report.inventory', value: 'inventory' },
    { label: 'report.customers', value: 'customers' },
    { label: 'report.analytics', value: 'analytics' },
  ],
  availableFilters: ['type'] as const,
  defaultFilters: { type: 'all' as const },
};

export const reportListConfig = {
  columns: reportListColumns,
  filters: reportFilterConfig,
  defaultSort: { field: 'name', order: 'asc' as const },
  pageSize: 20,
  features: { rowActions: true, pagination: true },
  rowActions: { edit: false, delete: false, view: true },
};
