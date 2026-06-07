import type { AmazonProduct } from '../api/amazon-api';
import type { Category } from '../../categories/types';
import { getLocalizedName } from '../../categories/types';

const MAX_SUB_NAME_LEN = 35;
const MIN_SUB_NAME_LEN = 2;

/** Rainforest / Amazon browse nodes — too broad for a subcategory label. */
const GENERIC_BROWSE_NAMES =
  /^(all|aps|everything|departments|products|أمازون|amazon|كل\s|جميع|الكل|electronics|إلكترونيات)$/i;

const TITLE_SPLIT_PATTERN = /\s+(?:من\s+سلسلة|from\s+the|by\s+|[-–—|]|،|,|\()\s*/i;
const SERIES_PATTERN =
  /\b(series|سلسلة|proffesional|professional|edition|model|mk\d|gen\s*\d)\b/i;

export interface AmazonCategoryHint {
  name: string;
  depth: number;
}

export interface ParentCategorySuggestion {
  category: Category;
  score: number;
  matchedHint?: string;
}

function normalizeName(value?: string | null): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function tokenSet(value: string): Set<string> {
  return new Set(
    normalizeName(value)
      .split(/[\s\-_/]+/)
      .filter((t) => t.length > 1),
  );
}

function overlapScore(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 100;
  if (na.includes(nb) || nb.includes(na)) return 75;

  const ta = tokenSet(a);
  const tb = tokenSet(b);
  if (ta.size === 0 || tb.size === 0) return 0;

  let shared = 0;
  for (const token of ta) {
    if (tb.has(token)) shared += 1;
  }
  if (shared === 0) return 0;
  return Math.round((shared / Math.max(ta.size, tb.size)) * 60);
}

/** Extract Amazon browse path from Rainforest product payload. */
export function extractAmazonCategoryHints(product: AmazonProduct): AmazonCategoryHint[] {
  const raw = (product as AmazonProduct & { categories?: unknown }).categories;
  if (!Array.isArray(raw)) return [];

  const hints: AmazonCategoryHint[] = [];
  raw.forEach((entry, index) => {
    const name =
      typeof entry === 'string'
        ? entry.trim()
        : typeof entry === 'object' && entry !== null
          ? String((entry as { name?: string }).name ?? '').trim()
          : '';
    if (name) hints.push({ name, depth: index });
  });
  return hints;
}

function isGenericBrowseName(name: string): boolean {
  const n = normalizeName(name);
  if (!n || n.length < 2) return true;
  if (GENERIC_BROWSE_NAMES.test(n)) return true;
  return false;
}

/** Short subcategory label — never the full product title. */
export function deriveShortSubcategoryName(
  product: AmazonProduct,
  hints: AmazonCategoryHint[] = extractAmazonCategoryHints(product),
): string {
  for (let i = hints.length - 1; i >= 0; i -= 1) {
    const candidate = hints[i].name.trim();
    if (
      candidate.length >= MIN_SUB_NAME_LEN &&
      candidate.length <= MAX_SUB_NAME_LEN &&
      !isGenericBrowseName(candidate) &&
      !SERIES_PATTERN.test(candidate)
    ) {
      return candidate;
    }
  }

  let title = String(product.title ?? '').trim();
  if (!title) return '';

  title = title.split(TITLE_SPLIT_PATTERN)[0]?.trim() || title;

  if (product.brand) {
    const brand = product.brand.trim();
    if (brand && title.toLowerCase().startsWith(brand.toLowerCase())) {
      title = title.slice(brand.length).trim();
    }
  }

  title = title.replace(SERIES_PATTERN, '').replace(/\s+/g, ' ').trim();

  if (title.length > MAX_SUB_NAME_LEN) {
    const words = title.split(/\s+/).filter(Boolean);
    let shortened = '';
    for (const word of words) {
      const next = shortened ? `${shortened} ${word}` : word;
      if (next.length > MAX_SUB_NAME_LEN) break;
      shortened = next;
    }
    title = shortened || title.slice(0, MAX_SUB_NAME_LEN).trim();
  }

  return title;
}

export function isValidSubcategoryName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < MIN_SUB_NAME_LEN || trimmed.length > MAX_SUB_NAME_LEN) return false;
  if (SERIES_PATTERN.test(trimmed) && trimmed.length > 24) return false;
  return true;
}

/** Score Forsa main categories against Amazon browse hints (best match first). */
export function suggestParentCategories(
  mainCategories: Category[],
  product: AmazonProduct,
  language = 'en',
  limit = 4,
): ParentCategorySuggestion[] {
  const hints = extractAmazonCategoryHints(product);
  const scored: ParentCategorySuggestion[] = [];

  for (const category of mainCategories) {
    const labels = [
      getLocalizedName(category, language),
      category.name,
      category.translations?.ar?.name,
      category.translations?.en?.name,
    ].filter(Boolean) as string[];

    let bestScore = 0;
    let matchedHint: string | undefined;

    for (const hint of hints) {
      for (const label of labels) {
        const score = overlapScore(hint.name, label);
        if (score > bestScore) {
          bestScore = score;
          matchedHint = hint.name;
        }
      }
    }

    if (bestScore > 0) {
      scored.push({ category, score: bestScore, matchedHint });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export function findMatchingSubcategory(
  children: Category[],
  subName: string,
  language = 'en',
): Category | undefined {
  const target = normalizeName(subName);
  if (!target) return undefined;

  for (const child of children) {
    const labels = [
      getLocalizedName(child, language),
      child.name,
      child.translations?.ar?.name,
    ].filter(Boolean) as string[];

    for (const label of labels) {
      const n = normalizeName(label);
      if (n === target || n.includes(target) || target.includes(n)) {
        return child;
      }
    }
  }
  return undefined;
}
