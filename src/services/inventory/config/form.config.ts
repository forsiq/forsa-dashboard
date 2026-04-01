import type { FormFieldConfig } from '@core/services/types';

export const productFormFields: FormFieldConfig[] = [
  { name: 'name', label: 'product.name', type: 'text', required: true, grid: { xs: 12, md: 6 } },
  { name: 'sku', label: 'product.sku', type: 'text', required: true, grid: { xs: 12, md: 6 } },
  { name: 'barcode', label: 'product.barcode', type: 'text', grid: { xs: 12, md: 6 } },
  { name: 'categoryId', label: 'product.category', type: 'select', grid: { xs: 12, md: 6 } },
  { name: 'price', label: 'product.price', type: 'number', required: true, grid: { xs: 12, md: 3 } },
  { name: 'cost', label: 'product.cost', type: 'number', grid: { xs: 12, md: 3 } },
  { name: 'quantity', label: 'product.quantity', type: 'number', required: true, grid: { xs: 12, md: 3 } },
  { name: 'minStock', label: 'product.min_stock', type: 'number', grid: { xs: 12, md: 3 } },
  { name: 'status', label: 'product.status', type: 'select', options: [
    { label: 'product.active', value: 'active' },
    { label: 'product.inactive', value: 'inactive' },
    { label: 'product.discontinued', value: 'discontinued' },
  ], defaultValue: 'active', grid: { xs: 12 } },
  { name: 'description', label: 'product.description', type: 'textarea', grid: { xs: 12 } },
  { name: 'imageUrl', label: 'product.image', type: 'image', grid: { xs: 12 } },
];

export const productFormConfig = {
  fields: productFormFields,
  layout: 'vertical' as const,
  columns: 2,
};
