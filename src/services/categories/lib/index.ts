export {
  // Constants
  NAME_MAX,
  DESC_MAX,
  ICON_MAX,
  NAME_AR_MAX,
  SLUG_MAX,
  REJECTION_REASON_MAX,
  MAX_CATEGORY_LEVEL,
  // Schemas
  categoryFormSchema,
  suggestCategorySchema,
  rejectSuggestionSchema,
  // Types
  type CategoryFormData,
  type SuggestCategoryFormData,
  type RejectSuggestionFormData,
  type FieldErrors,
  // Helpers
  slugifyCategoryName,
  toCreateCategoryPayload,
  toUpdateCategoryPayload,
  toSuggestCategoryPayload,
  mapCategoryApiError,
} from './category.validation';

export {
  analyzeCategoryHealth,
  isCategoryPickerSafe,
  categoryHasIssues,
  type CategoryIssue,
  type CategoryIssueType,
  type CategoryHealthReport,
} from './categoryHealth';

export { buildCategoryTreeFromFlat } from './buildCategoryTree';
