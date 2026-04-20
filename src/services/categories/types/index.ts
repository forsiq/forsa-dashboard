// --- Category Types ---
// Must match the auction-service NestJS backend DTO

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  projectId?: number;
  translations?: Record<string, Record<string, string>>;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  // Computed fields for frontend display
  productCount?: number;
  // Legacy compat - mapped from translations in frontend
  nameAr?: string;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  // Arabic name stored in translations
  nameAr?: string;
}

export interface UpdateCategoryInput {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  nameAr?: string;
}

export interface CategoryFilters {
  search?: string;
  isActive?: boolean | 'all';
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
  total?: number;
  success?: boolean;
  message?: string;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
