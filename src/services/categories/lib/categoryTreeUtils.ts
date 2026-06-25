import type { CategoryTreeNode } from '../types';
import { getLocalizedName, getLocalizedDescription } from '../types';
import { categorySearchMatches } from './categorySearch';
import type { CategoryIssue } from './categoryHealth';
import { getIconByName } from '@core/components/IconPicker';
import { Folder, FolderOpen, LayoutGrid } from 'lucide-react';
import type React from 'react';

export type StatusTab = 'all' | 'active' | 'inactive' | 'issues';

export type CategoryViewMode = 'table' | 'grid';

export const CATEGORIES_VIEW_MODE_KEY = 'forsa_categories_view_mode';

export function readStoredCategoryViewMode(): CategoryViewMode {
  if (typeof window === 'undefined') return 'table';
  return localStorage.getItem(CATEGORIES_VIEW_MODE_KEY) === 'grid' ? 'grid' : 'table';
}

export function nodeMatchesStatus(node: CategoryTreeNode, statusFilter: StatusTab): boolean {
  if (statusFilter === 'all') return true;
  const wantActive = statusFilter === 'active';
  return node.isActive === wantActive;
}

export function nodeMatchesSearch(node: CategoryTreeNode, language: string, query: string): boolean {
  if (!query) return true;
  return (
    categorySearchMatches(getLocalizedName(node, language), query) ||
    categorySearchMatches(node.slug ?? '', query) ||
    categorySearchMatches(getLocalizedDescription(node, language), query)
  );
}

export function filterCategoryTree(
  nodes: CategoryTreeNode[],
  language: string,
  statusFilter: StatusTab,
  search: string,
): CategoryTreeNode[] {
  const filterNode = (node: CategoryTreeNode): CategoryTreeNode | null => {
    const filteredChildren = (node.children ?? [])
      .map(filterNode)
      .filter((child): child is CategoryTreeNode => child !== null);

    const selfMatches =
      nodeMatchesStatus(node, statusFilter) && nodeMatchesSearch(node, language, search.trim());

    if (!selfMatches && filteredChildren.length === 0) return null;

    return {
      ...node,
      children: filteredChildren,
    };
  };

  return nodes.map(filterNode).filter((node): node is CategoryTreeNode => node !== null);
}

/** Stable signature for tree order — avoids redundant localTree syncs. */
export function getCategoryTreeSignature(nodes: CategoryTreeNode[]): string {
  const parts: string[] = [];
  const walk = (list: CategoryTreeNode[]) => {
    for (const node of list) {
      parts.push(`${node.id}:${node.sortOrder ?? 0}`);
      if (node.children?.length) walk(node.children);
    }
  };
  walk(nodes);
  return parts.join(',');
}

export function filterIssuesTree(
  nodes: CategoryTreeNode[],
  issuesByCategoryId: Map<string, CategoryIssue[]>,
): CategoryTreeNode[] {
  const filterNode = (node: CategoryTreeNode): CategoryTreeNode | null => {
    const filteredChildren = (node.children ?? [])
      .map(filterNode)
      .filter((child): child is CategoryTreeNode => child !== null);

    const selfHasIssues = (issuesByCategoryId.get(String(node.id))?.length ?? 0) > 0;

    if (!selfHasIssues && filteredChildren.length === 0) return null;

    return {
      ...node,
      children: filteredChildren,
    };
  };

  return nodes.map(filterNode).filter((node): node is CategoryTreeNode => node !== null);
}

export function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const next = array.slice();
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
}

export function findSiblingContext(
  nodes: CategoryTreeNode[],
  targetId: string,
  parentId: string | null = null,
): { siblings: CategoryTreeNode[]; parentId: string | null } | null {
  if (nodes.some((n) => String(n.id) === targetId)) {
    return { siblings: nodes, parentId };
  }
  for (const node of nodes) {
    if (!node.children?.length) continue;
    const found = findSiblingContext(node.children, targetId, node.id);
    if (found) return found;
  }
  return null;
}

export function reorderSiblingsInTree(
  nodes: CategoryTreeNode[],
  parentId: string | null,
  orderedIds: string[],
): CategoryTreeNode[] {
  if (parentId === null) {
    const byId = new Map(nodes.map((n) => [String(n.id), n]));
    return orderedIds.map((id) => byId.get(id)).filter((n): n is CategoryTreeNode => Boolean(n));
  }
  return nodes.map((node) => {
    if (String(node.id) === String(parentId)) {
      const byId = new Map((node.children ?? []).map((c) => [String(c.id), c]));
      return {
        ...node,
        children: orderedIds
          .map((id) => byId.get(id))
          .filter((c): c is CategoryTreeNode => Boolean(c)),
      };
    }
    if (node.children?.length) {
      return {
        ...node,
        children: reorderSiblingsInTree(node.children, parentId, orderedIds),
      };
    }
    return node;
  });
}

export function countTreeNodes(nodes: CategoryTreeNode[]): number {
  let count = 0;
  const walk = (list: CategoryTreeNode[]) => {
    for (const node of list) {
      count += 1;
      if (node.children?.length) walk(node.children);
    }
  };
  walk(nodes);
  return count;
}

export function resolveCategoryTreeIcon(
  node: CategoryTreeNode,
  hasChildren: boolean,
  expanded: boolean,
): React.ComponentType<{ className?: string }> {
  const custom = node.icon ? getIconByName(node.icon) : null;
  if (custom) return custom;
  if (hasChildren) return expanded ? FolderOpen : Folder;
  return LayoutGrid;
}
