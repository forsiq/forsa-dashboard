/**
 * Category List Configuration
 *
 * Defines how categories are displayed in tables and lists.
 * Includes columns, filters, and sorting options.
 */

import type { ColumnConfig } from '@core/services/types';
import type { Category } from '../types';

// ============================================================================
// Table Columns
// ============================================================================

/**
 * Column definitions for the categories table.
 * These are used by SmartTable to render the table.
 *
 * Note: The render function receives the value and row, and should return
 * a React node. This must be provided at runtime since we're in a .ts file.
 */
export const categoryListColumns: ColumnConfig[] = [
  {
    key: 'name',
    label: 'category.name',
    sortable: true,
    filterable: false,
    align: 'left',
  },
  {
    key: 'slug',
    label: 'category.slug',
    sortable: true,
    filterable: false,
    align: 'left',
    type: 'text',
  },
  {
    key: 'productCount',
    label: 'category.products_count',
    sortable: true,
    filterable: false,
    align: 'center',
    type: 'text',
  },
  {
    key: 'status',
    label: 'category.status',
    sortable: true,
    filterable: true,
    align: 'center',
    type: 'status',
  },
  {
    key: 'order',
    label: 'category.order',
    sortable: true,
    filterable: false,
    align: 'center',
    type: 'text',
  },
];

// ============================================================================
// Filter Configuration
// ============================================================================

export const categoryFilterConfig = {
  // Status filter options
  statusOptions: [
    { label: 'category.all', value: 'all' },
    { label: 'category.active', value: 'active' },
    { label: 'category.inactive', value: 'inactive' },
  ],

  // Parent filter options (would be loaded dynamically)
  parentOptions: [
    { label: 'category.all', value: 'all' },
    { label: 'category.no_parent', value: 'none' },
  ],

  // Available filter fields
  availableFilters: ['search', 'status', 'parentId'] as const,

  // Default filter values
  defaultFilters: {
    status: 'all' as const,
    parentId: 'all' as const,
    sortBy: 'name' as const,
    sortOrder: 'asc' as const,
  },
};

// ============================================================================
// List Configuration
// ============================================================================

export const categoryListConfig = {
  columns: categoryListColumns,
  filters: categoryFilterConfig,

  // Default sorting
  defaultSort: {
    field: 'name',
    order: 'asc' as const,
  },

  // Pagination
  pageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],

  // Table features
  features: {
    rowActions: true,
    selection: true,
    expansion: true,
    pagination: true,
  },

  // Row actions
  rowActions: {
    edit: true,
    delete: true,
    view: false,
  },

  // Expandable row content fields
  expandableFields: ['description', 'nameAr', 'createdAt', 'updatedAt'],
};
