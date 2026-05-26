/** Categories API - Using REST */
import { createApiClient } from '@core/services/ApiClientFactory';
import type { 
  Category, 
  CreateCategoryInput, 
  UpdateCategoryInput, 
  CategoryFilters, 
  CategoryStats,
  CategoriesResponse,
  CategoryTreeResponse,
  CategorySuggestion,
  SuggestCategoryInput,
  ReviewSuggestionInput
} from '../types';

/**
 * Base Category API implementation.
 * Requests use the shared axios client (`createApiClient`), which sets `Accept-Language`
 * from the language cookie (`getLanguage()`). Localized category **names** in responses
 * still depend on the auction-service returning `translations`, `nameAr`, or locale-aware fields;
 * if only `name` is populated, the UI shows that default (often English) via `getLocalizedName`.
 */
import { API_BASE_URL } from '@config/api';

export const categoryBaseApi = createApiClient<Category, CreateCategoryInput, UpdateCategoryInput, CategoryFilters>({
  serviceName: 'categories',
  endpoint: '/categories',
  apiBaseUrl: API_BASE_URL,
});

export async function getCategories(filters: CategoryFilters = {} as any, signal?: AbortSignal): Promise<CategoriesResponse> {
  const response = await categoryBaseApi.list(filters) as any;
  const categories = response.data || [];
  const total = response.total || categories.length;
  
  return {
    categories,
    total,
    page: filters.page || 1,
    limit: filters.limit || 50,
    totalPages: Math.ceil(total / (filters.limit || 50)),
  };
}

export async function getCategory(id: string): Promise<Category> {
  const response = await categoryBaseApi.getById(id);
  return response.data;
}

export async function getCategoryStats(): Promise<CategoryStats> {
  const response = await categoryBaseApi.getStats();
  const stats = response.data;
  return {
    total: stats.total || 0,
    active: stats.active || 0,
    inactive: stats.inactive || 0,
    withParent: stats.with_parent || 0,
    withoutParent: stats.without_parent || 0,
  };
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const response = await categoryBaseApi.create(input);
  return response.data;
}

export async function updateCategory(input: UpdateCategoryInput): Promise<Category> {
  const response = await categoryBaseApi.update({ ...input, id: input.id! });
  return response.data;
}

export async function deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
  await categoryBaseApi.delete(id);
  return { success: true, message: 'Category deleted successfully' };
}

/** Persist display order in one request (auction-service PATCH /categories/reorder). */
export async function reorderCategories(ids: string[]): Promise<void> {
  const client = categoryBaseApi.getInstance();
  await client.patch('/categories/reorder', {
    ids: ids.map((id) => Number(id)),
  });
}

export async function getCategoryTree(signal?: AbortSignal): Promise<CategoryTreeResponse> {
  const client = categoryBaseApi.getInstance();
  const response = await client.get('/categories/tree', { signal });
  return { tree: response.data?.data || [] };
}

export async function getMainCategories(signal?: AbortSignal): Promise<Category[]> {
  const client = categoryBaseApi.getInstance();
  const response = await client.get('/categories/main', { signal });
  return response.data?.data || [];
}

export async function getCategoryChildren(parentId: string | number, signal?: AbortSignal): Promise<Category[]> {
  const client = categoryBaseApi.getInstance();
  const response = await client.get(`/categories/${parentId}/children`, { signal });
  return response.data?.data || [];
}

export async function suggestCategory(input: SuggestCategoryInput): Promise<CategorySuggestion> {
  const client = categoryBaseApi.getInstance();
  const response = await client.post('/categories/suggest', input);
  return response.data?.data;
}

export async function getCategorySuggestions(status?: string, signal?: AbortSignal): Promise<CategorySuggestion[]> {
  const client = categoryBaseApi.getInstance();
  const params: any = {};
  if (status) params.status = status;
  const response = await client.get('/categories/suggestions', { params, signal });
  return response.data?.data || [];
}

export async function reviewSuggestion(id: string, input: ReviewSuggestionInput): Promise<void> {
  const client = categoryBaseApi.getInstance();
  await client.patch(`/categories/suggestions/${id}/review`, input);
}

export async function getMySuggestions(signal?: AbortSignal): Promise<CategorySuggestion[]> {
  const client = categoryBaseApi.getInstance();
  const response = await client.get('/categories/suggestions/mine', { signal });
  return response.data?.data || [];
}

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: CategoryFilters) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  stats: () => [...categoryKeys.all, 'stats'] as const,
  tree: () => [...categoryKeys.all, 'tree'] as const,
  mainCategories: () => [...categoryKeys.all, 'main'] as const,
  children: (parentId: string | number) => [...categoryKeys.all, 'children', parentId] as const,
  suggestions: () => [...categoryKeys.all, 'suggestions'] as const,
  mySuggestions: () => [...categoryKeys.all, 'my-suggestions'] as const,
};

