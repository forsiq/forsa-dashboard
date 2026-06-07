import { createCategory, getCategoryChildren } from '../../categories/api/categories';
import type { Category } from '../../categories/types';
import {
  deriveShortSubcategoryName,
  extractAmazonCategoryHints,
  findMatchingSubcategory,
  isValidSubcategoryName,
} from './amazon-category-hints';
import type { AmazonProduct } from '../api/amazon-api';

export type ImportCategoryMode = 'auto_sub' | 'existing_sub' | 'parent_only';

export interface ResolveImportCategoryInput {
  product: AmazonProduct;
  parentId: number;
  mode: ImportCategoryMode;
  /** User-edited sub name (auto_sub) or ignored for existing_sub */
  subName?: string;
  /** Selected existing subcategory id */
  existingSubId?: number;
  canCreateCategory: boolean;
  language?: string;
  /** Preloaded children — fetched when omitted */
  children?: Category[];
}

export interface ResolveImportCategoryResult {
  categoryId: number;
  createdSubcategory?: Category;
  matchedExisting?: Category;
  usedParentOnly?: boolean;
}

export async function resolveImportCategory(
  input: ResolveImportCategoryInput,
): Promise<ResolveImportCategoryResult> {
  const {
    product,
    parentId,
    mode,
    subName: subNameInput,
    existingSubId,
    canCreateCategory,
    language = 'en',
  } = input;

  const children =
    input.children ?? (await getCategoryChildren(parentId));

  if (mode === 'existing_sub' && existingSubId) {
    const picked = children.find((c) => Number(c.id) === existingSubId);
    if (picked) {
      return { categoryId: Number(picked.id), matchedExisting: picked };
    }
  }

  if (mode === 'parent_only') {
    return { categoryId: parentId, usedParentOnly: true };
  }

  const hints = extractAmazonCategoryHints(product);
  const subName =
    (subNameInput ?? '').trim() ||
    deriveShortSubcategoryName(product, hints);

  const existing = findMatchingSubcategory(children, subName, language);
  if (existing) {
    return { categoryId: Number(existing.id), matchedExisting: existing };
  }

  if (canCreateCategory && isValidSubcategoryName(subName)) {
    const created = await createCategory({
      name: subName,
      parentId,
      isActive: true,
    });
    return {
      categoryId: Number(created.id),
      createdSubcategory: created,
    };
  }

  // Fallback: parent only when sub cannot be created/matched
  return { categoryId: parentId, usedParentOnly: true };
}
