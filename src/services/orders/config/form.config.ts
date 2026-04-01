import type { FormFieldConfig } from '@core/services/types';

export const orderFormFields: FormFieldConfig[] = [
  { name: 'customerId', label: 'orders.customer', type: 'select', required: true, grid: { xs: 12 } },
  { name: 'currency', label: 'orders.currency', type: 'select', options: [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'IQD', value: 'IQD' },
  ], defaultValue: 'USD', grid: { xs: 12, md: 4 } },
  { name: 'priority', label: 'orders.priority', type: 'select', options: [
    { label: 'orders.priority.low', value: 'low' },
    { label: 'orders.priority.medium', value: 'medium' },
    { label: 'orders.priority.high', value: 'high' },
    { label: 'orders.priority.urgent', value: 'urgent' },
  ], defaultValue: 'medium', grid: { xs: 12, md: 4 } },
  { name: 'status', label: 'orders.status', type: 'select', options: [
    { label: 'orders.status.pending', value: 'pending' },
    { label: 'orders.status.processing', value: 'processing' },
  ], defaultValue: 'pending', grid: { xs: 12, md: 4 } },
  { name: 'notes', label: 'orders.notes', type: 'textarea', grid: { xs: 12 } },
];

export const orderFormConfig = {
  fields: orderFormFields,
  layout: 'vertical' as const,
  columns: 2,
};
