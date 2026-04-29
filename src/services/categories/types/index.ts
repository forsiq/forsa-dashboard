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

/**
 * Get the localized name for a category based on the current language.
 * Falls back to the default `name` if no translation is available.
 */
export function getLocalizedName(
  category: Category,
  language: string,
): string {
  if (!category) return '';
  const translated = category.translations?.[language]?.name;
  if (translated) return translated;
  if (language === 'ar' && category.nameAr) return category.nameAr;
  return category.name;
}

/**
 * Get the localized description for a category based on the current language.
 * Falls back to the default `description` if no translation is available.
 */
export function getLocalizedDescription(
  category: Category,
  language: string,
): string {
  if (!category) return '';
  return category.translations?.[language]?.description || category.description || '';
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
