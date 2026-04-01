import { useQuery } from '@tanstack/react-query';
import type { CategoryFilters, CategoryStats, Category, CategoriesResponse } from '../types';
import { categoryKeys } from '../api/categories';

// Mock data generators
const generateMockCategories = (filters: CategoryFilters = {}): any => {
  const mockCategories = [
    { id: '1', name: 'Electronics', nameAr: 'إلكترونيات', slug: 'electronics', description: 'Electronic devices', status: 'active', order: 1, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', parentId: null },
    { id: '2', name: 'Clothing', nameAr: 'ملابس', slug: 'clothing', description: 'Fashion items', status: 'active', order: 2, createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z', parentId: null },
    { id: '3', name: 'Books', nameAr: 'كتب', slug: 'books', description: 'Books and media', status: 'active', order: 3, createdAt: '2024-01-03T00:00:00Z', updatedAt: '2024-01-03T00:00:00Z', parentId: null },
    { id: '4', name: 'Sports', nameAr: 'رياضة', slug: 'sports', description: 'Sports equipment', status: 'inactive', order: 4, createdAt: '2024-01-04T00:00:00Z', updatedAt: '2024-01-04T00:00:00Z', parentId: null },
    { id: '5', name: 'Mobile Phones', nameAr: 'هواتف محمولة', slug: 'mobile-phones', description: 'Smartphones', status: 'active', order: 1, createdAt: '2024-01-05T00:00:00Z', updatedAt: '2024-01-05T00:00:00Z', parentId: '1' },
    { id: '6', name: 'Laptops', nameAr: 'أجهزة كمبيوتر محمولة', slug: 'laptops', description: 'Laptops', status: 'active', order: 2, createdAt: '2024-01-06T00:00:00Z', updatedAt: '2024-01-06T00:00:00Z', parentId: '1' },
    { id: '7', name: "Men's Clothing", nameAr: "ملابس الرجال", slug: 'mens-clothing', description: 'Men fashion', status: 'active', order: 1, createdAt: '2024-01-07T00:00:00Z', updatedAt: '2024-01-07T00:00:00Z', parentId: '2' },
    { id: '8', name: "Women's Clothing", nameAr: 'ملابس النساء', slug: 'womens-clothing', description: 'Women fashion', status: 'active', order: 2, createdAt: '2024-01-08T00:00:00Z', updatedAt: '2024-01-08T00:00:00Z', parentId: '2' },
  ];

  let filtered = mockCategories;

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(searchLower) ||
      c.nameAr?.toLowerCase().includes(searchLower) ||
      c.description?.toLowerCase().includes(searchLower)
    );
  }

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(c => c.status === filters.status);
  }

  // Apply parent filter
  if (filters.parentId === 'none') {
    filtered = filtered.filter(c => !c.parentId);
  } else if (filters.parentId && filters.parentId !== 'all') {
    filtered = filtered.filter(c => c.parentId === filters.parentId);
  }

  return {
    categories: filtered,
    total: filtered.length,
    page: filters.page || 1,
    limit: filters.limit || 50,
    totalPages: 1,
  };
};

const generateMockCategory = (id: string): Category => {
  const allCategories = generateMockCategories().categories;
  return allCategories.find(c => c.id === id) || allCategories[0];
};

const generateMockCategoryStats = (): CategoryStats => ({
  total: 8,
  active: 7,
  inactive: 1,
  withParent: 3,
  withoutParent: 5,
});

// --- Query Hooks ---

/**
 * Fetch categories with filters
 *
 * @example
 * const { data, isLoading, error } = useGetCategories({
 *   page: 1,
 *   limit: 20,
 *   status: 'active'
 * });
 */
export function useGetCategories(filters: CategoryFilters = {}) {
  return useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: () => generateMockCategories(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch a single category by ID
 *
 * @example
 * const { data, isLoading, error } = useGetCategory('category-id');
 */
export function useGetCategory(id: string, enabled = true) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => generateMockCategory(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch category statistics
 *
 * @example
 * const { data, isLoading } = useGetCategoryStats();
 */
export function useGetCategoryStats() {
  return useQuery({
    queryKey: categoryKeys.stats(),
    queryFn: generateMockCategoryStats,
    staleTime: 2 * 60 * 1000,
  });
}

// --- Prefetch Functions ---

/**
 * Prefetch category data for faster navigation
 *
 * @example
 * const queryClient = useQueryClient();
 * prefetchCategory(queryClient, 'category-id');
 */
export async function prefetchCategory(
  queryClient: any,
  id: string
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => generateMockCategory(id),
    staleTime: 10 * 60 * 1000,
  });
}
