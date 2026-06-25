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
  resolveCategoryNamesForApi,
  isPrimarilyArabic,
  toCreateCategoryPayload,
  toUpdateCategoryPayload,
  toSuggestCategoryPayload,
  mapCategoryApiError,
  resolveCategoryErrorMessage,
  suggestAlternativeCategoryName,
  classifyCategoryApiError,
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

export {
  normalizeCategorySearchText,
  categorySearchMatches,
} from './categorySearch';

export {
  type StatusTab,
  type CategoryViewMode,
  CATEGORIES_VIEW_MODE_KEY,
  readStoredCategoryViewMode,
  nodeMatchesStatus,
  nodeMatchesSearch,
  filterCategoryTree,
  getCategoryTreeSignature,
  filterIssuesTree,
  arrayMove,
  findSiblingContext,
  reorderSiblingsInTree,
  countTreeNodes,
  resolveCategoryTreeIcon,
} from './categoryTreeUtils';
