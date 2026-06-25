import type React from 'react';
import type { Category, CategoryTreeNode } from '../types';
import type { CategoryIssue } from '../lib';

export interface TreeNodeSharedProps {
  node: CategoryTreeNode;
  level: number;
  language: string;
  dir: 'ltr' | 'rtl';
  canManage: boolean;
  onEdit: (category: Category) => void;
  onToggleStatus: (category: Category) => void;
  onDelete: (id: string) => void;
  onAddChild?: (node: CategoryTreeNode) => void;
  onAddSibling?: (node: CategoryTreeNode) => void;
  openConfirm: (options: {
    title: string;
    message: string;
    variant?: 'default' | 'destructive' | 'warning';
    confirmText?: string;
    onConfirm: () => void;
  }) => void;
  t: (key: string) => string;
  canReorder?: boolean;
  showDragHandle?: boolean;
  isLastSibling?: boolean;
  ancestorContinues?: boolean[];
  issuesByCategoryId?: Map<string, CategoryIssue[]>;
  onContextMenu?: (e: React.MouseEvent, node: CategoryTreeNode) => void;
  /** Expand nested rows when search/filter highlights subcategories. */
  autoExpand?: boolean;
}
