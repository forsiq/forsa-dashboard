import type { FormFieldConfig } from '@core/services/types';

export const customerFormFields: FormFieldConfig[] = [
  { name: 'name', label: 'customer.name', type: 'text', required: true, grid: { xs: 12, md: 6 } },
  { name: 'email', label: 'customer.email', type: 'email', required: true, grid: { xs: 12, md: 6 } },
  { name: 'phone', label: 'customer.phone', type: 'text', grid: { xs: 12, md: 6 } },
  { name: 'type', label: 'customer.type', type: 'select', options: [
    { label: 'customer.individual', value: 'individual' },
    { label: 'customer.business', value: 'business' },
  ], defaultValue: 'individual', grid: { xs: 12, md: 6 } },
  { name: 'status', label: 'customer.status', type: 'select', options: [
    { label: 'customer.active', value: 'active' },
    { label: 'customer.inactive', value: 'inactive' },
    { label: 'customer.blocked', value: 'blocked' },
  ], defaultValue: 'active', grid: { xs: 12, md: 6 } },
  { name: 'company', label: 'customer.company', type: 'text', grid: { xs: 12 } },
  { name: 'address.street', label: 'address.street', type: 'text', grid: { xs: 12, md: 6 } },
  { name: 'address.city', label: 'address.city', type: 'text', grid: { xs: 12, md: 3 } },
  { name: 'address.state', label: 'address.state', type: 'text', grid: { xs: 12, md: 3 } },
  { name: 'address.country', label: 'address.country', type: 'text', grid: { xs: 12, md: 6 } },
];

export const customerFormConfig = {
  fields: customerFormFields,
  layout: 'vertical' as const,
  columns: 2,
};
