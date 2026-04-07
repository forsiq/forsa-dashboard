/** Categories API - Using GraphQL */
import * as api from '../graphql/api';
import type { Category, CreateCategoryInput, UpdateCategoryInput, CategoryFilters, CategoryStats } from '../types';
import { categoryGraphQLKeys } from '../graphql/api';

export async function getCategories(filters: CategoryFilters = {} as any) {
  return await api.getCategories(filters);
}

export async function getCategory(id: string) {
  return await api.getCategory(id);
}

export async function getCategoryStats() {
  return await api.getCategoryStats();
}

export async function createCategory(input: CreateCategoryInput) {
  return await api.createCategory(input);
}

export async function updateCategory(input: UpdateCategoryInput) {
  return await api.updateCategory(input);
}

export async function deleteCategory(id: string) {
  return await api.deleteCategory(id);
}

export const categoryKeys = categoryGraphQLKeys;
