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

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

/**
 * Create / edit category form schema.
 * `name` is required after trim(); all other fields optional with limits.
 */
export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'category.validation.name_required')
    .max(NAME_MAX, 'category.validation.name_max'),
  nameAr: z
    .string()
    .max(NAME_AR_MAX, 'category.validation.name_max')
    .optional()
    .or(z.literal('')),
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
  return name
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/\//g, '-')
    .slice(0, SLUG_MAX);
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
  options?: PayloadOptions,
) {
  const slug = options?.existingSlug ?? slugifyCategoryName(data.name);

  const payload: Record<string, unknown> = {
    name: data.name.trim(),
    slug: slug || undefined,
    description: data.description?.trim() || undefined,
    icon: data.icon?.trim() || undefined,
    isActive: data.isActive ?? true,
    parentId: data.parentId ? Number(data.parentId) : null,
  };

  if (options?.sortOrder !== undefined) {
    payload.sortOrder = options.sortOrder;
  }

  if (data.nameAr?.trim()) {
    payload.nameAr = data.nameAr.trim();
  }

  return payload;
}

/**
 * Build an UpdateCategoryInput from form data.
 * Includes `id` from options and preserves existing sortOrder.
 */
export function toUpdateCategoryPayload(
  data: CategoryFormData,
  options: PayloadOptions & { id: string },
) {
  const payload = toCreateCategoryPayload(data, {
    existingSlug: options.existingSlug,
    sortOrder: options.sortOrder,
  });

  return { ...payload, id: options.id };
}

/**
 * Build a SuggestCategoryInput from suggest form data.
 */
export function toSuggestCategoryPayload(data: SuggestCategoryFormData) {
  return {
    name: data.name.trim(),
    description: data.description?.trim() || undefined,
    parentId: data.parentId ? Number(data.parentId) : undefined,
  };
}

// ---------------------------------------------------------------------------
// API Error Mapper
// ---------------------------------------------------------------------------

export type FieldErrors = Record<string, string>;

/**
 * Map a backend API error to field-level errors for RHF `setError`.
 *
 * Handles:
 *  - Slug conflict (ConflictException 409)
 *  - Max depth exceeded (BadRequestException 400)
 *  - Parent not found (NotFoundException 404)
 *  - Generic / validation details
 */
export function mapCategoryApiError(error: unknown): FieldErrors {
  const err = error as Record<string, unknown> | undefined;
  if (!err) return { root: 'An unexpected error occurred' };

  const message = String(err.message ?? err.error ?? '');
  const status = (err as any).response?.status ?? (err as any).status;

  // Slug conflict
  if (
    message.toLowerCase().includes('slug') &&
    (message.toLowerCase().includes('exist') || status === 409)
  ) {
    return { slug: 'category.validation.slug_conflict' };
  }

  // Max depth exceeded
  if (
    message.toLowerCase().includes('maximum category depth') ||
    message.toLowerCase().includes('max')
  ) {
    return { parentId: 'category.validation.max_depth' };
  }

  // Parent not found
  if (
    message.toLowerCase().includes('parent') &&
    (message.toLowerCase().includes('not found') || status === 404)
  ) {
    return { parentId: 'category.validation.max_depth' };
  }

  // Backend field-level details (class-validator format)
  const details = (err as any).response?.data?.details ?? err.details;
  if (details && typeof details === 'object') {
    const fieldErrors: FieldErrors = {};
    for (const [field, messages] of Object.entries(details)) {
      if (Array.isArray(messages)) {
        fieldErrors[field] = messages[0];
      } else if (typeof messages === 'string') {
        fieldErrors[field] = messages;
      }
    }
    if (Object.keys(fieldErrors).length > 0) return fieldErrors;
  }

  return { root: message || 'An unexpected error occurred' };
}
