import type { Category, CategoryTreeNode } from '../types';
import { getLocalizedName } from '../types';

/** Build a hierarchical tree from a flat category list (includes inactive rows). */
export function buildCategoryTreeFromFlat(
  categories: Category[],
  language = 'en',
): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>();

  for (const cat of categories) {
    map.set(String(cat.id), { ...cat, children: [] });
  }

  const roots: CategoryTreeNode[] = [];

  for (const cat of categories) {
    const node = map.get(String(cat.id));
    if (!node) continue;

    if (cat.parentId != null && map.has(String(cat.parentId))) {
      map.get(String(cat.parentId))!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => {
      const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return getLocalizedName(a, language).localeCompare(
        getLocalizedName(b, language),
        language,
      );
    });
    nodes.forEach((n) => sortNodes(n.children));
  };

  sortNodes(roots);
  return roots;
}
