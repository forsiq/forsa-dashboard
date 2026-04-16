import type { FormFieldConfig } from '@core/services/types';

export const reportFormFields: FormFieldConfig[] = [
  { name: 'name', label: 'report.name', type: 'text', required: true, grid: { xs: 12 } },
  { name: 'type', label: 'report.type', type: 'select', options: [
    { label: 'report.sales', value: 'sales' },
    { label: 'report.inventory', value: 'inventory' },
    { label: 'report.customers', value: 'customers' },
    { label: 'report.analytics', value: 'analytics' },
  ], required: true, grid: { xs: 12, md: 6 } },
  { name: 'startDate', label: 'report.start_date', type: 'date', grid: { xs: 12, md: 3 } },
  { name: 'endDate', label: 'report.end_date', type: 'date', grid: { xs: 12, md: 3 } },
  { name: 'format', label: 'report.format', type: 'select', options: [
    { label: 'PDF', value: 'pdf' },
    { label: 'Excel', value: 'excel' },
    { label: 'CSV', value: 'csv' },
  ], defaultValue: 'pdf', grid: { xs: 12, md: 3 } },
  { name: 'description', label: 'report.description', type: 'textarea', grid: { xs: 12 } },
];

export const reportFormConfig = {
  fields: reportFormFields,
  layout: 'vertical' as const,
  columns: 2,
};
