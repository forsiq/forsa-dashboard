import type { Category } from '../types';
import { getLocalizedName } from '../types';

/** Detected quality / data issues on a category row. */
export type CategoryIssueType =
  | 'empty_name'
  | 'duplicate_name'
  | 'duplicate_slug'
  | 'test_like'
  | 'product_like'
  | 'orphan_parent'
  | 'missing_icon'
  | 'unused_empty'
  | 'level_mismatch'
  | 'missing_db_name';

export type CategoryIssueSeverity = 'error' | 'warning';

export interface CategoryIssue {
  type: CategoryIssueType;
  severity: CategoryIssueSeverity;
  /** i18n key under category.health.* */
  labelKey: string;
}

export interface CategoryHealthReport {
  issuesByCategoryId: Map<string, CategoryIssue[]>;
  summary: Record<CategoryIssueType, number>;
  totalAffected: number;
  totalCategories: number;
}

const TEST_NAME_PATTERN =
  /\b(test|demo|temp|sample|permission|mock|dummy|اختبار|إذن|تجربة)\b/i;

/** Product titles / SKUs accidentally stored as categories. */
const PRODUCT_LIKE_PATTERN =
  /\b(dash\s*cam|instax|series|proffesional|professional|a800s|mini\s*\d|model\s*#?\d{2,})\b|\d{3,}[a-z]{2,}|[a-z]{2,}\d{3,}/i;

function normalizeText(value?: string | null): string {
  return (value ?? '').trim().toLowerCase();
}

function displayName(category: Category, language = 'en'): string {
  return getLocalizedName(category, language).trim();
}

function hasEmptyName(category: Category): boolean {
  const hasEn = Boolean((category.name ?? '').trim());
  const hasAr = Boolean(
    (category.nameAr ?? '').trim() ||
    (category.translations?.ar?.name ?? '').trim(),
  );
  return !hasEn && !hasAr;
}

function isTestLike(category: Category): boolean {
  const blob = [
    category.name,
    category.slug,
    category.translations?.ar?.name,
    category.description,
  ]
    .filter(Boolean)
    .join(' ');
  return TEST_NAME_PATTERN.test(blob);
}

function isProductLike(category: Category): boolean {
  const name = category.name?.trim() ?? '';
  const arName = (category.nameAr ?? '').trim() || (category.translations?.ar?.name ?? '').trim();
  // Check EN name
  if (name.length >= 40) return true;
  if (PRODUCT_LIKE_PATTERN.test(name)) return true;
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 6 && /\d/.test(name)) return true;
  // Check AR name
  if (arName.length >= 40) return true;
  if (arName && /\d/.test(arName)) {
    const arWords = arName.split(/\s+/).filter(Boolean);
    if (arWords.length >= 6) return true;
  }
  return false;
}

function childCount(categoryId: string, categories: Category[]): number {
  return categories.filter((c) => String(c.parentId) === categoryId).length;
}

/**
 * Analyze a flat category list and return per-row issues + summary counts.
 * Pure function — safe for admin UI (no mutations).
 */
export function analyzeCategoryHealth(
  categories: Category[],
  language = 'en',
): CategoryHealthReport {
  const issuesByCategoryId = new Map<string, CategoryIssue[]>();
  const summary = {
    empty_name: 0,
    duplicate_name: 0,
    duplicate_slug: 0,
    test_like: 0,
    product_like: 0,
    orphan_parent: 0,
    missing_icon: 0,
    unused_empty: 0,
    level_mismatch: 0,
    missing_db_name: 0,
  } satisfies Record<CategoryIssueType, number>;

  const idSet = new Set(categories.map((c) => String(c.id)));

  const nameGroups = new Map<string, string[]>();
  const slugGroups = new Map<string, string[]>();

  for (const cat of categories) {
    const id = String(cat.id);
    const nameKey = normalizeText(displayName(cat, language) || cat.name);
    if (nameKey) {
      const group = nameGroups.get(nameKey) ?? [];
      group.push(id);
      nameGroups.set(nameKey, group);
    }
    const slugKey = normalizeText(cat.slug);
    if (slugKey) {
      const group = slugGroups.get(slugKey) ?? [];
      group.push(id);
      slugGroups.set(slugKey, group);
    }
  }

  const duplicateNameIds = new Set<string>();
  for (const ids of nameGroups.values()) {
    if (ids.length > 1) ids.forEach((id) => duplicateNameIds.add(id));
  }

  const duplicateSlugIds = new Set<string>();
  for (const ids of slugGroups.values()) {
    if (ids.length > 1) ids.forEach((id) => duplicateSlugIds.add(id));
  }

  const pushIssue = (categoryId: string, issue: CategoryIssue) => {
    const list = issuesByCategoryId.get(categoryId) ?? [];
    if (!list.some((i) => i.type === issue.type)) {
      list.push(issue);
      issuesByCategoryId.set(categoryId, list);
      summary[issue.type] += 1;
    }
  };

  for (const cat of categories) {
    const id = String(cat.id);

    if (hasEmptyName(cat)) {
      pushIssue(id, {
        type: 'empty_name',
        severity: 'error',
        labelKey: 'category.health.empty_name',
      });
    }

    if (duplicateNameIds.has(id)) {
      pushIssue(id, {
        type: 'duplicate_name',
        severity: 'warning',
        labelKey: 'category.health.duplicate_name',
      });
    }

    if (duplicateSlugIds.has(id)) {
      pushIssue(id, {
        type: 'duplicate_slug',
        severity: 'warning',
        labelKey: 'category.health.duplicate_slug',
      });
    }

    if (isTestLike(cat)) {
      pushIssue(id, {
        type: 'test_like',
        severity: 'warning',
        labelKey: 'category.health.test_like',
      });
    }

    if (isProductLike(cat)) {
      pushIssue(id, {
        type: 'product_like',
        severity: 'warning',
        labelKey: 'category.health.product_like',
      });
    }

    // missing_db_name: slug is known but DB name is empty
    if (!(cat.name ?? '').trim() && cat.slug) {
      pushIssue(id, {
        type: 'missing_db_name',
        severity: 'warning',
        labelKey: 'category.health.missing_db_name',
      });
    }

    if (cat.parentId != null && !idSet.has(String(cat.parentId))) {
      pushIssue(id, {
        type: 'orphan_parent',
        severity: 'error',
        labelKey: 'category.health.orphan_parent',
      });
    }

    if (cat.isActive !== false && !cat.icon?.trim()) {
      pushIssue(id, {
        type: 'missing_icon',
        severity: 'warning',
        labelKey: 'category.health.missing_icon',
      });
    }

    const hasChildren = childCount(id, categories) > 0;
    const products = cat.productCount ?? 0;
    // Relax unused_empty for root categories — they may be structural placeholders
    if (cat.isActive !== false && products === 0 && !hasChildren && cat.parentId != null) {
      pushIssue(id, {
        type: 'unused_empty',
        severity: 'warning',
        labelKey: 'category.health.unused_empty',
      });
    }

    const expectedLevel = cat.parentId != null ? 1 : 0;
    if (cat.level != null && cat.level !== expectedLevel) {
      pushIssue(id, {
        type: 'level_mismatch',
        severity: 'warning',
        labelKey: 'category.health.level_mismatch',
      });
    }
  }

  return {
    issuesByCategoryId,
    summary,
    totalAffected: issuesByCategoryId.size,
    totalCategories: categories.length,
  };
}

/** Categories that should not appear in merchant pickers (create auction). */
export function isCategoryPickerSafe(
  categoryId: string,
  report: CategoryHealthReport,
): boolean {
  const issues = report.issuesByCategoryId.get(categoryId) ?? [];
  const blocked = new Set<CategoryIssueType>([
    'empty_name',
    'test_like',
    'product_like',
    'orphan_parent',
  ]);
  return !issues.some((i) => blocked.has(i.type));
}

export function categoryHasIssues(
  categoryId: string,
  report: CategoryHealthReport,
): boolean {
  return (report.issuesByCategoryId.get(categoryId)?.length ?? 0) > 0;
}
