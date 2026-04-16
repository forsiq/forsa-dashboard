/**
 * Category Service Configuration
 *
 * Main export for the categories service configuration.
 * Combines entity schema, list config, and form config into a single service definition.
 */

import { createCrudService } from '@core/services';
import type { CrudServiceConfig } from '@core/services';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryFilters,
  CategoryStats,
} from '../types';
import { categoryEntityMeta } from './entity.schema';
import { categoryListConfig } from './list.config';
import { categoryFormConfig } from './form.config';

// ============================================================================
// Service Configuration
// ============================================================================

export const categoryServiceConfig: CrudServiceConfig = {
  name: 'categories',
  endpoint: '/api/v1/categories',
};

// ============================================================================
// Create Service Instance
// ============================================================================

/**
 * Category CRUD Service
 *
 * @example
 * import { categoryService } from '@services/categories';
 *
 * // In a component:
 * const { useList, useById, useCreate, useUpdate, useDelete } = categoryService;
 *
 * function CategoryList() {
 *   const { data: categories, isLoading } = useList({ page: 1, limit: 20 });
 *   const createMutation = useCreate();
 *   // ...
 * }
 */
export const categoryService = createCrudService<
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryFilters
>(categoryServiceConfig);

// ============================================================================
// Export Types
// ============================================================================

export type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryFilters,
  CategoryStats,
};

// ============================================================================
// Export Configuration
// ============================================================================

export { categoryEntityMeta, categoryListConfig, categoryFormConfig };

// ============================================================================
// Export Config Helpers
// ============================================================================

/**
 * Get translation key for a field
 */
export function getCategoryFieldLabel(field: string): string {
  return `category.${field}`;
}

/**
 * Get all filter options for categories
 */
export function getCategoryFilterOptions() {
  return {
    status: [
      { label: 'category.all', value: 'all' },
      { label: 'category.active', value: 'active' },
      { label: 'category.inactive', value: 'inactive' },
    ],
    hasParent: [
      { label: 'category.all', value: 'all' },
      { label: 'category.no_parent', value: 'none' },
      { label: 'category.with_parent', value: 'with_parent' },
    ],
  };
}

/**
 * Get stats configuration for categories
 */
export function getCategoryStatsConfig() {
  return {
    fields: ['total', 'active', 'inactive', 'withParent', 'withoutParent'],
    labels: {
      total: 'category.total',
      active: 'category.active',
      inactive: 'category.inactive',
      withParent: 'category.with_parent',
      withoutParent: 'category.main',
    },
  };
}

// ============================================================================
// Default Export
// ============================================================================

export default categoryService;
