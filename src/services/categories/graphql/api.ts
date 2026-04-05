/**
 * Categories GraphQL API Functions
 * Uses 'product' service for category operations
 */

import { gqlQuery, gqlMutation } from '@core/services/GraphQLClient';
import * as Queries from './queries';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryFilters,
  CategoriesResponse,
  CategoryStats,
} from '../types';

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get paginated list of categories
 */
export async function getCategories(filters: CategoryFilters = {}): Promise<CategoriesResponse> {
  const variables = Queries.buildCategoryVariables(filters);

  const data = await gqlQuery<{
    categories: Category[];
    categoryCount: number;
  }>(Queries.GET_CATEGORIES_QUERY, variables, 'product');

  return {
    categories: data.categories || [],
    total: data.categoryCount || 0,
    page: filters.page || 1,
    limit: filters.limit || 50,
    totalPages: Math.ceil((data.categoryCount || 0) / (filters.limit || 50)),
  };
}

/**
 * Get a single category by ID
 */
export async function getCategory(id: string): Promise<Category> {
  const data = await gqlQuery<{ category: Category }>(
    Queries.GET_CATEGORY_QUERY,
    { id },
    'product'
  );
  return data.category;
}

/**
 * Get category statistics
 */
export async function getCategoryStats(): Promise<CategoryStats> {
  const data = await gqlQuery<{ categoryStats: CategoryStats }>(
    Queries.GET_CATEGORY_STATS_QUERY,
    {},
    'product'
  );
  return data.categoryStats;
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Create a new category
 */
export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const data = await gqlMutation<{ createCategory: Category }>(
    Queries.CREATE_CATEGORY_MUTATION,
    { input },
    'product'
  );
  return data.createCategory;
}

/**
 * Update an existing category
 */
export async function updateCategory(input: UpdateCategoryInput): Promise<Category> {
  const { id, ...data } = input;
  const result = await gqlMutation<{ updateCategory: Category }>(
    Queries.UPDATE_CATEGORY_MUTATION,
    { id, input: data },
    'product'
  );
  return result.updateCategory;
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
  const data = await gqlMutation<{ deleteCategory: { success: boolean; message: string } }>(
    Queries.DELETE_CATEGORY_MUTATION,
    { id },
    'product'
  );
  return data.deleteCategory;
}

/**
 * Update category status
 */
export async function updateCategoryStatus(id: string, status: Category['status']): Promise<Category> {
  const data = await gqlMutation<{ updateCategoryStatus: Category }>(
    Queries.UPDATE_CATEGORY_STATUS_MUTATION,
    { id, status },
    'product'
  );
  return data.updateCategoryStatus;
}

// ============================================================================
// Query Keys for React Query Cache
// ============================================================================

export const categoryGraphQLKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryGraphQLKeys.all, 'list'] as const,
  list: (filters: CategoryFilters) => [...categoryGraphQLKeys.lists(), filters] as const,
  details: () => [...categoryGraphQLKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryGraphQLKeys.details(), id] as const,
  stats: () => [...categoryGraphQLKeys.all, 'stats'] as const,
};
