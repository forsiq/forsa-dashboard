// --- Category Types ---

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  createdAt: string;
  // Fields not in remote schema - kept for local compatibility
  nameAr?: string;
  status?: 'active' | 'inactive';
  order?: number;
  image?: string;
  productCount?: number;
  updatedAt?: string;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  // Optional fields not in remote schema
  nameAr?: string;
  status?: 'active' | 'inactive';
  order?: number;
  image?: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

export interface CategoryFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  parentId?: string | 'all' | 'none';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  withParent: number;
  withoutParent: number;
}

// --- API Error Types ---

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
