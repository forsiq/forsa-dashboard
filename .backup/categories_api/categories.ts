import axios from 'axios';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryFilters,
  CategoriesResponse,
  CategoryStats,
} from '../types';

// --- API Client Configuration ---

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_VERSION = 'v1';
const CATEGORY_ENDPOINT = `${API_BASE_URL}/api/${API_VERSION}/categories`;

// Create axios instance for categories
const categoryClient = axios.create({
  baseURL: CATEGORY_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
categoryClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
categoryClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({
      message,
      code: error.response?.data?.code,
      status: error.response?.status,
      details: error.response?.data?.details,
    });
  }
);

// --- API Functions ---

/**
 * Fetch categories with optional filters
 */
export async function getCategories(
  filters: CategoryFilters = {}
): Promise<CategoriesResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.parentId) {
    if (filters.parentId === 'none') {
      params.append('parent_id', 'none');
    } else if (filters.parentId !== 'all') {
      params.append('parent_id', filters.parentId);
    }
  }
  params.append('page', String(filters.page || 1));
  params.append('limit', String(filters.limit || 50));
  if (filters.sortBy) params.append('sort_by', filters.sortBy);
  if (filters.sortOrder) params.append('sort_order', filters.sortOrder);

  const response = await categoryClient.get(`/?${params.toString()}`);
  return response.data;
}

/**
 * Fetch a single category by ID
 */
export async function getCategory(id: string): Promise<Category> {
  const response = await categoryClient.get(`/${id}`);
  return response.data;
}

/**
 * Create a new category
 */
export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const response = await categoryClient.post('/', input);
  return response.data;
}

/**
 * Update an existing category
 */
export async function updateCategory(input: UpdateCategoryInput): Promise<Category> {
  const { id, ...data } = input;
  const response = await categoryClient.patch(`/${id}`, data);
  return response.data;
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
  await categoryClient.delete(`/${id}`);
}

/**
 * Get category statistics
 */
export async function getCategoryStats(): Promise<CategoryStats> {
  const response = await categoryClient.get('/stats');
  return response.data;
}

/**
 * Upload category image
 */
export async function uploadCategoryImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await categoryClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

// --- Category Keys for Query Cache Management ---

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: CategoryFilters) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  stats: () => [...categoryKeys.all, 'stats'] as const,
} as const;
