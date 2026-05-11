// --- Category Types ---
// Must match the auction-service NestJS backend DTO

import { translations } from '@core/lib/utils/translations';
import { en as appEn } from '../../../translations/en';
import { ar as appAr } from '../../../translations/ar';

function auctionCategoryKeyFromSlug(slug: string): string {
  return `auction.category.${slug.trim().replace(/-/g, '_')}`;
}

/** Labels shipped with core-ui (static bundle). */
function labelFromCoreTranslations(language: string, slug?: string): string | null {
  if (!slug?.trim()) return null;
  const key = auctionCategoryKeyFromSlug(slug);
  const order = language === 'ku' ? ['ku', 'en'] : language === 'ar' ? ['ar', 'en'] : ['en'];
  for (const lang of order) {
    const bundle = (translations as Record<string, Record<string, unknown>>)[lang];
    const v = bundle?.[key];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return null;
}

/** Extra slug → label overrides from app `extraTranslations` (merged at runtime into `t()`, not in static core `translations`). */
function labelFromAppAuctionKeys(language: string, slug?: string): string | null {
  if (!slug?.trim()) return null;
  const key = auctionCategoryKeyFromSlug(slug);
  const primary = language === 'ar' ? appAr : appEn;
  const v = primary[key];
  if (typeof v === 'string' && v.trim()) return v;
  if (language === 'ku') {
    const fallback = appEn[key];
    if (typeof fallback === 'string' && fallback.trim()) return fallback;
  }
  return null;
}

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
 * Falls back through: API `translations` → `nameAr` (ar) → built-in `auction.category.<slug>`
 * (core-ui + app extra keys) when UI is not English → default `name` → prettified slug.
 */
export function getLocalizedName(
  category: Category,
  language: string,
): string {
  if (!category) return '';
  const translated = category.translations?.[language]?.name;
  if (translated?.trim()) return translated;
  if (language === 'ar' && category.nameAr?.trim()) return category.nameAr;

  if (language !== 'en') {
    const fromCore = labelFromCoreTranslations(language, category.slug);
    if (fromCore) return fromCore;
    const fromApp = labelFromAppAuctionKeys(language, category.slug);
    if (fromApp) return fromApp;
  }

  if (category.name?.trim()) return category.name;

  if (language === 'en' && category.slug) {
    const fromCore = labelFromCoreTranslations('en', category.slug);
    if (fromCore) return fromCore;
    const fromApp = labelFromAppAuctionKeys('en', category.slug);
    if (fromApp) return fromApp;
  }

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
