import { z } from 'zod';

// ---------------------------------------------------------------------------
// Constants — aligned with auction-service DTO limits
// ---------------------------------------------------------------------------

export const NAME_MAX = 100;
export const DESC_MAX = 500;
export const ICON_MAX = 50;
export const NAME_AR_MAX = 100;
export const SLUG_MAX = 50;
export const REJECTION_REASON_MAX = 500;
/** Backend MAX_CATEGORY_LEVEL = 1 (root + one child) */
export const MAX_CATEGORY_LEVEL = 1;

/** Reserved names that should never be used as categories. */
const RESERVED_CATEGORY_NAMES = [
  'test', 'demo', 'temp', 'sample', 'permission', 'mock', 'dummy',
  'مزاد', 'صفقة جماعية', 'اختبار', 'إذن', 'تجربة',
];
const RESERVED_CATEGORY_NAME_PATTERN = new RegExp(
  `^(?:${RESERVED_CATEGORY_NAMES.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`,
  'i',
);

/** Check if a name looks like a product listing title rather than a category. */
export function isProductLikeName(name: string): boolean {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return false;
  if (trimmed.length >= 40) return true;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 6 && /\d/.test(trimmed)) return true;
  const PRODUCT_PATTERN =
    /\b(dash\s*cam|instax|series|proffesional|professional|a800s|mini\s*\d|model\s*#?\d{2,})\b|\d{3,}[a-z]{2,}|[a-z]{2,}\d{3,}/i;
  if (PRODUCT_PATTERN.test(trimmed)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const optionalNameField = z
  .string()
  .max(NAME_MAX, 'category.validation.name_max')
  .optional()
  .or(z.literal(''));

const optionalNameArField = z
  .string()
  .max(NAME_AR_MAX, 'category.validation.name_max')
  .optional()
  .or(z.literal(''));

function validateCategoryNameValue(
  value: string,
  ctx: z.RefinementCtx,
  path: 'name' | 'nameAr',
) {
  if (!value) return;
  if (RESERVED_CATEGORY_NAME_PATTERN.test(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'category.validation.reserved_name',
      path: [path],
    });
  }
  if (isProductLikeName(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'category.validation.product_like_name',
      path: [path],
    });
  }
}

/**
 * Create / edit category form schema.
 * At least one of `name` or `nameAr` is required (min 2 chars after trim).
 */
export const categoryFormSchema = z
  .object({
    name: optionalNameField,
    nameAr: optionalNameArField,
    description: z
      .string()
      .max(DESC_MAX, 'category.validation.description_max')
      .optional()
      .or(z.literal('')),
    icon: z
      .string()
      .max(ICON_MAX, 'category.validation.icon_max')
      .optional()
      .or(z.literal('')),
    isActive: z.boolean().optional(),
    parentId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const name = (data.name ?? '').trim();
    const nameAr = (data.nameAr ?? '').trim();

    if (name.length < 2 && nameAr.length < 2) {
      const issue = {
        code: z.ZodIssueCode.custom,
        message: 'category.validation.name_required',
      };
      ctx.addIssue({ ...issue, path: ['name'] });
      ctx.addIssue({ ...issue, path: ['nameAr'] });
      return;
    }

    validateCategoryNameValue(name, ctx, 'name');
    validateCategoryNameValue(nameAr, ctx, 'nameAr');
  });

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

/**
 * Suggest-a-category form — `name` required, description + parentId optional.
 */
export const suggestCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'category.validation.name_required')
    .max(NAME_MAX, 'category.validation.name_max'),
  description: z
    .string()
    .max(DESC_MAX, 'category.validation.description_max')
    .optional()
    .or(z.literal('')),
  parentId: z.string().optional(),
});

export type SuggestCategoryFormData = z.infer<typeof suggestCategorySchema>;

/**
 * Reject-suggestion form — `rejectionReason` required + max 500.
 */
export const rejectSuggestionSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(1, 'category.validation.rejection_required')
    .max(REJECTION_REASON_MAX, 'category.validation.rejection_max'),
});

export type RejectSuggestionFormData = z.infer<typeof rejectSuggestionSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Slugify a category name to match backend logic:
 * lowercase, replace spaces & slashes with hyphens, slice to SLUG_MAX.
 */
export function slugifyCategoryName(name: string): string {
  return (name ?? '')
    .trim()
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/\//g, '-')
    .slice(0, SLUG_MAX);
}

/** Check if a slug contains non-ASCII characters (guidance to use EN names). */
export function hasNonAsciiSlug(name: string): boolean {
  const slug = slugifyCategoryName(name);
  return /[^\x00-\x7F]/.test(slug);
}

/** True when most characters are Arabic script (dashboard Arabic-primary flow). */
export function isPrimarilyArabic(text: string): boolean {
  const trimmed = (text ?? '').trim();
  if (!trimmed) return false;
  const arabicChars = (trimmed.match(/[\u0600-\u06FF]/g) || []).length;
  return arabicChars / trimmed.length >= 0.4;
}

/**
 * Map form fields to API `name` / `nameAr` based on dashboard language.
 * Arabic UI: `nameAr` is primary; English can be customized in secondary field.
 */
export function resolveCategoryNamesForApi(
  data: CategoryFormData,
  primaryLanguage = 'en',
): { name: string; nameAr?: string } {
  const name = (data.name ?? '').trim();
  const nameAr = (data.nameAr ?? '').trim();
  const arabicPrimary = primaryLanguage === 'ar';

  if (arabicPrimary) {
    const arabicName = nameAr || name;
    const englishName = name;
    return {
      name: englishName || arabicName,
      nameAr: arabicName,
    };
  }

  return {
    name: name || nameAr,
    nameAr: nameAr || undefined,
  };
}

// ---------------------------------------------------------------------------
// Payload Mappers
// ---------------------------------------------------------------------------

export interface PayloadOptions {
  existingSlug?: string;
  sortOrder?: number;
  existingId?: string;
}

/**
 * Build a CreateCategoryInput from form data.
 * Strips empty strings, converts parentId to number | null.
 */
export function toCreateCategoryPayload(
  data: CategoryFormData,
  options?: PayloadOptions & { primaryLanguage?: string },
) {
  const { primaryLanguage = 'en', ...payloadOptions } = options ?? {};
  const resolved = resolveCategoryNamesForApi(data, primaryLanguage);
  const slug =
    payloadOptions?.existingSlug ?? slugifyCategoryName(resolved.name);

  const payload: Record<string, unknown> = {
    name: resolved.name,
    slug: slug || undefined,
    description: data.description?.trim() || undefined,
    icon: data.icon?.trim() || undefined,
    isActive: data.isActive ?? true,
    parentId: data.parentId ? Number(data.parentId) : null,
  };

  if (payloadOptions?.sortOrder !== undefined) {
    payload.sortOrder = payloadOptions.sortOrder;
  }

  if (resolved.nameAr?.trim()) {
    payload.nameAr = resolved.nameAr.trim();
  }

  return payload;
}

/**
 * Build an UpdateCategoryInput from form data.
 * Includes `id` from options and preserves existing sortOrder.
 */
export function toUpdateCategoryPayload(
  data: CategoryFormData,
  options: PayloadOptions & { id: string; primaryLanguage?: string },
) {
  const payload = toCreateCategoryPayload(data, {
    existingSlug: options.existingSlug,
    sortOrder: options.sortOrder,
    primaryLanguage: options.primaryLanguage,
  });

  return { ...payload, id: options.id };
}

/**
 * Build a SuggestCategoryInput from suggest form data.
 */
export function toSuggestCategoryPayload(data: SuggestCategoryFormData) {
  return {
    name: (data.name ?? '').trim(),
    description: data.description?.trim() || undefined,
    parentId: data.parentId ? Number(data.parentId) : undefined,
  };
}

// ---------------------------------------------------------------------------
// API Error Mapper
// ---------------------------------------------------------------------------

export type FieldErrors = Record<string, string>;

type TranslateFn = (key: string, variables?: Record<string, string | number>) => string;

/** Normalize axios / ApiClientFactory error message to a single string. */
export function extractCategoryApiMessage(error: unknown): string {
  const err = error as Record<string, unknown> | undefined;
  if (!err) return '';

  const raw =
    err.message ??
    (err as { response?: { data?: { message?: unknown } } }).response?.data?.message ??
    err.error;

  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === 'string').join(' · ');
  }
  if (typeof raw === 'string') return raw.trim();
  return '';
}

export type CategoryApiErrorKind =
  | 'slug_conflict'
  | 'max_depth'
  | 'parent_not_found'
  | 'unknown';

/** Classify auction-service category errors for i18n mapping. */
export function classifyCategoryApiError(error: unknown): CategoryApiErrorKind {
  const message = extractCategoryApiMessage(error).toLowerCase();
  const status =
    (error as { status?: number })?.status ??
    (error as { response?: { status?: number } })?.response?.status;

  if (
    (message.includes('slug') && message.includes('exist')) ||
    status === 409
  ) {
    return 'slug_conflict';
  }

  if (message.includes('maximum category depth') || message.includes('levels exceeded')) {
    return 'max_depth';
  }

  if (message.includes('parent') && message.includes('not found')) {
    return 'parent_not_found';
  }

  return 'unknown';
}

const CATEGORY_ERROR_KEYS: Record<Exclude<CategoryApiErrorKind, 'unknown'>, string> = {
  slug_conflict: 'category.validation.slug_conflict',
  max_depth: 'category.validation.max_depth',
  parent_not_found: 'category.validation.parent_not_found',
};

/** Localized user-facing message for toasts and banners. */
export function resolveCategoryErrorMessage(
  error: unknown,
  t: TranslateFn,
): string {
  const kind = classifyCategoryApiError(error);
  if (kind !== 'unknown') {
    return t(CATEGORY_ERROR_KEYS[kind]);
  }

  const message = extractCategoryApiMessage(error);
  if (message) return message;

  return t('category.error.unexpected');
}

/**
 * Suggest an alternate category name when slug conflicts (appends -2, -3, …).
 * Keeps within NAME_MAX after suffix.
 */
export function suggestAlternativeCategoryName(name: string): string {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return trimmed;

  const match = trimmed.match(/^(.*?)(?:-(\d+))?$/);
  const base = (match?.[1] ?? trimmed).trim();
  const nextNum = match?.[2] ? parseInt(match[2], 10) + 1 : 2;
  const suffix = `-${nextNum}`;
  const maxBaseLen = Math.max(1, NAME_MAX - suffix.length);
  return `${base.slice(0, maxBaseLen)}${suffix}`;
}

/**
 * Map a backend API error to field-level errors for RHF `setError`.
 * Values are translation keys (pass through `t()` when rendering).
 *
 * Handles:
 *  - Slug conflict (ConflictException 409) → name + root
 *  - Max depth exceeded (BadRequestException 400)
 *  - Parent not found (NotFoundException 404)
 *  - Generic / validation details
 */
export function mapCategoryApiError(error: unknown): FieldErrors {
  const kind = classifyCategoryApiError(error);

  if (kind === 'slug_conflict') {
    const key = CATEGORY_ERROR_KEYS.slug_conflict;
    return { name: key, root: key };
  }

  if (kind === 'max_depth') {
    return { parentId: CATEGORY_ERROR_KEYS.max_depth, root: CATEGORY_ERROR_KEYS.max_depth };
  }

  if (kind === 'parent_not_found') {
    return {
      parentId: CATEGORY_ERROR_KEYS.parent_not_found,
      root: CATEGORY_ERROR_KEYS.parent_not_found,
    };
  }

  const err = error as Record<string, unknown> | undefined;
  if (!err) return { root: 'category.error.unexpected' };

  // Backend field-level details (class-validator format)
  const details =
    (err as { response?: { data?: { details?: unknown } } }).response?.data?.details ??
    err.details;
  if (details && typeof details === 'object') {
    const fieldErrors: FieldErrors = {};
    for (const [field, messages] of Object.entries(details)) {
      if (Array.isArray(messages) && typeof messages[0] === 'string') {
        fieldErrors[field] = messages[0];
      } else if (typeof messages === 'string') {
        fieldErrors[field] = messages;
      }
    }
    if (Object.keys(fieldErrors).length > 0) return fieldErrors;
  }

  const message = extractCategoryApiMessage(error);
  return { root: message || 'category.error.unexpected' };
}
