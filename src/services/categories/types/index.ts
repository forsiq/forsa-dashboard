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
 * Falls back through: translation → nameAr → name → slug (capitalized).
 */
export function getLocalizedName(
  category: Category,
  language: string,
): string {
  if (!category) return '';
  const translated = category.translations?.[language]?.name;
  if (translated?.trim()) return translated;
  if (language === 'ar' && category.nameAr?.trim()) return category.nameAr;
  if (category.name?.trim()) return category.name;
  if (category.slug) {
    return category.slug
      .split(/[-_]/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return '';
}

/**
 * Get the localized description for a category based on the current language.
 * Falls back through: translation → description.
 */
export function getLocalizedDescription(
  category: Category,
  language: string,
): string {
  if (!category) return '';
  const translated = category.translations?.[language]?.description;
  if (translated?.trim()) return translated;
  return category.description || '';
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
