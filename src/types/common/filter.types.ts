/**
 * Filter, Sort, and Search Types
 * Used for API queries with filtering and sorting
 */

import type { PageParams } from './pagination.types';

export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'nin' | 'between';

export interface Filter {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams {
  search?: string;
  searchFields?: string[];
}

/**
 * Combined query parameters for list endpoints
 */
export interface ListParams extends PageParams, SortParams, SearchParams {
  filters?: Filter[];
}

/**
 * Create a filter object
 */
export function createFilter(field: string, operator: FilterOperator, value: unknown): Filter {
  return { field, operator, value };
}
