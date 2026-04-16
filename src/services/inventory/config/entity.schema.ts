/** Inventory Entity Schema */
export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  sku: string;
  barcode?: string;
  description?: string;
  price: number;
  cost?: number;
  quantity: number;
  minStock: number;
  maxStock?: number;
  categoryId?: string;
  categoryName?: string;
  status: 'active' | 'inactive' | 'discontinued';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  nameAr?: string;
  sku: string;
  barcode?: string;
  description?: string;
  price: number;
  cost?: number;
  quantity: number;
  minStock: number;
  maxStock?: number;
  categoryId?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  imageUrl?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'discontinued' | 'all';
  lowStock?: boolean;
  outOfStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InventoryStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  lowStockValue: number;
  totalStock: number;
  recentMovements: number;
}

export const inventoryEntityMeta = {
  name: 'inventory',
  singular: 'product',
  plural: 'products',
  endpoint: '/api/v1/inventory',
  basePath: '/inventory',
  i18nPrefix: 'inventory',
  defaults: { status: 'active' as const, quantity: 0, minStock: 5 },
  sortableFields: ['name', 'sku', 'price', 'quantity'] as const,
  filterableFields: ['search', 'category', 'status', 'lowStock', 'outOfStock'] as const,
  requiredFields: ['name', 'sku', 'price'] as const,
  hiddenFields: ['categoryId', 'imageUrl', 'createdAt', 'updatedAt'] as const,
};
