/**
 * Category Entity Schema
 *
 * Defines the Category entity structure and metadata.
 * Used by the CrudServiceFactory to generate types and validations.
 */

// ============================================================================
// Entity Type Definition
// ============================================================================

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  parent?: Category;
  status: 'active' | 'inactive';
  order?: number;
  image?: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Create/Update Input Types
// ============================================================================

export interface CreateCategoryInput {
  name: string;
  nameAr?: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  status?: 'active' | 'inactive';
  order?: number;
  image?: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface CategoryFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  parentId?: string | 'all' | 'none';
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'order' | 'createdAt' | 'productCount';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Stats Types
// ============================================================================

export interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  withParent: number;
  withoutParent: number;
}

// ============================================================================
// Entity Metadata
// ============================================================================

export const categoryEntityMeta = {
  name: 'categories',
  singular: 'category',
  plural: 'categories',
  endpoint: '/api/v1/categories',
  basePath: '/categories',

  // Translation key prefix
  i18nPrefix: 'category',

  // Default field values
  defaults: {
    status: 'active' as const,
    order: 0,
  },

  // Fields that can be used for sorting
  sortableFields: ['name', 'order', 'createdAt', 'productCount'] as const,

  // Fields that can be used for filtering
  filterableFields: ['search', 'status', 'parentId'] as const,

  // Fields that are required for creation
  requiredFields: ['name'] as const,

  // Fields that should not be displayed in tables
  hiddenFields: ['parentId', 'parent', 'createdAt', 'updatedAt'] as const,
};

export type CategorySortableField = typeof categoryEntityMeta.sortableFields[number];
export type CategoryFilterableField = typeof categoryEntityMeta.filterableFields[number];
