/** Inventory Entity Schema - re-exports types from the main types module */
export type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  InventoryStats,
  StockStatus,
  ProductFilters,
} from '../types';

export const inventoryEntityMeta = {
  name: 'inventory',
  singular: 'product',
  plural: 'products',
  endpoint: '/api/v1/inventory',
  basePath: '/inventory',
  i18nPrefix: 'inventory',
  defaults: { stockQuantity: 0, lowStockThreshold: 5, currency: 'IQD', unit: 'piece' },
  sortableFields: ['sku', 'costPrice', 'sellingPrice', 'stockQuantity', 'createdAt'] as const,
  filterableFields: ['search', 'stockStatus', 'isActive'] as const,
  requiredFields: ['listingId', 'sku', 'costPrice', 'sellingPrice'] as const,
  hiddenFields: ['metadata', 'createdAt', 'updatedAt'] as const,
};

export const stockStatusOptions: Array<{ value: string; labelKey: string }> = [
  { value: 'in_stock', labelKey: 'inventory.status.in_stock' },
  { value: 'low_stock', labelKey: 'inventory.status.low_stock' },
  { value: 'out_of_stock', labelKey: 'inventory.status.out_of_stock' },
  { value: 'discontinued', labelKey: 'inventory.status.discontinued' },
];
