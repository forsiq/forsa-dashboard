import type { ColumnConfig } from '@core/services/types';

export const orderListColumns: ColumnConfig[] = [
  { key: 'orderNumber', label: 'orders.table.id', sortable: true, align: 'left' },
  { key: 'customerName', label: 'orders.table.customer', sortable: true, align: 'left' },
  { key: 'total', label: 'orders.table.total', sortable: true, align: 'center' },
  { key: 'status', label: 'orders.table.status', sortable: true, align: 'center', type: 'status' },
  { key: 'paymentStatus', label: 'orders.table.payment', sortable: true, align: 'center', type: 'status' },
  { key: 'createdAt', label: 'orders.table.date', sortable: true, align: 'center' },
];

export const orderFilterConfig = {
  statusOptions: [
    { label: 'common.all', value: 'all' },
    { label: 'orders.status.pending', value: 'pending' },
    { label: 'orders.status.processing', value: 'processing' },
    { label: 'orders.status.delivered', value: 'delivered' },
    { label: 'orders.status.cancelled', value: 'cancelled' },
  ],
  availableFilters: ['search', 'status', 'paymentStatus'] as const,
  defaultFilters: { status: 'all' as const },
};

export const orderListConfig = {
  columns: orderListColumns,
  filters: orderFilterConfig,
  defaultSort: { field: 'createdAt', order: 'desc' as const },
  pageSize: 20,
  features: { rowActions: true, selection: true, pagination: true },
  rowActions: { edit: true, delete: true, view: true },
};
