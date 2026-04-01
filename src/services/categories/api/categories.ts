/** Categories API Compatibility */
import { categoryService } from '../config';
import type { Category, CreateCategoryInput, UpdateCategoryInput, CategoryFilters, CategoryStats } from '../types';

export async function getCategories(filters: CategoryFilters = {} as any) {
  const response = await categoryService.api.list(filters);
  return response.data;
}

export async function getCategory(id: string) {
  const response = await categoryService.api.getById(id);
  return response.data;
}

export async function getCategoryStats() {
  const response = await categoryService.api.getStats();
  return response.data;
}

export async function createCategory(input: CreateCategoryInput) {
  const response = await categoryService.api.create(input);
  return response.data;
}

export async function updateCategory(input: UpdateCategoryInput) {
  const response = await categoryService.api.update(input);
  return response.data;
}

export async function deleteCategory(id: string) {
  await categoryService.api.delete(id);
}

export const categoryKeys = categoryService.queryKeys;