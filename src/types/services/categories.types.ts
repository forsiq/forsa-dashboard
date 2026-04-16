/**
 * Category Types
 * Ready-made service types - DO NOT MODIFY unless necessary
 */

import type { ApiResponse } from '../common';

/**
 * Category entity
 */
export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  parentId?: string;
  image?: string;
  order: number;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create/Update category request
 */
export interface CreateCategoryRequest {
  name: string;
  nameAr?: string;
  slug: string;
  parentId?: string;
  image?: string;
  order: number;
  isActive?: boolean;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

/**
 * Category list response
 */
export interface GetCategoriesResponse {
  categories: Category[];
}

/**
 * Category detail response
 */
export interface CategoryResponse {
  category: Category;
}

/**
 * API response types for categories
 */
export type CategoriesListResponse = ApiResponse<GetCategoriesResponse>;
export type CategoryDetailResponse = ApiResponse<CategoryResponse>;
