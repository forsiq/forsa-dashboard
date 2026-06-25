import { Plus, Edit, Power, PowerOff, Trash2 } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';
import type { Category, CategoryTreeNode } from '../types';
import { getLocalizedName } from '../types';

interface CategoryRowActionsProps {
  node: CategoryTreeNode;
  language: string;
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
  className?: string;
}

export function CategoryRowActions({
  node,
  language,
  canManage,
  onEdit,
  onToggleStatus,
  onDelete,
  onAddChild,
  onAddSibling,
  openConfirm,
  t,
  className,
}: CategoryRowActionsProps) {
  if (!canManage) return null;

  const isMain = !node.parentId;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {isMain && onAddChild && (
        <button
          type="button"
          onClick={() => onAddChild(node)}
          className="p-2 rounded-lg text-zinc-muted hover:text-success hover:bg-success/10 transition-all"
          title={t('category.add_subcategory') || 'Add subcategory'}
          aria-label={t('category.add_subcategory') || 'Add subcategory'}
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
      {!isMain && onAddSibling && (
        <button
          type="button"
          onClick={() => onAddSibling(node)}
          className="p-2 rounded-lg text-zinc-muted hover:text-info hover:bg-info/10 transition-all"
          title={t('category.add_sibling') || 'Add sibling'}
          aria-label={t('category.add_sibling') || 'Add sibling'}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        type="button"
        onClick={() => onEdit(node)}
        className="p-2 rounded-lg text-zinc-muted hover:text-brand hover:bg-brand/10 transition-all"
        title={t('common.edit') || 'Edit'}
        aria-label={t('common.edit') || 'Edit'}
      >
        <Edit className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onToggleStatus(node)}
        className={cn(
          'p-2 rounded-lg transition-all',
          node.isActive
            ? 'text-zinc-muted hover:text-warning hover:bg-warning/10'
            : 'text-zinc-muted hover:text-success hover:bg-success/10',
        )}
        title={
          node.isActive
            ? t('category.deactivate') || 'Deactivate'
            : t('category.activate') || 'Activate'
        }
        aria-label={
          node.isActive
            ? t('category.deactivate') || 'Deactivate'
            : t('category.activate') || 'Activate'
        }
      >
        {node.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
      </button>
      <button
        type="button"
        onClick={() => {
          openConfirm({
            title: t('category.delete') || 'Delete Category',
            message: `${t('category.delete_confirm') || 'Are you sure?'}\n\n"${getLocalizedName(node, language)}"`,
            variant: 'destructive',
            onConfirm: () => onDelete(node.id),
          });
        }}
        className="p-2 rounded-lg text-zinc-muted hover:text-danger hover:bg-danger/10 transition-all"
        title={t('common.delete') || 'Delete'}
        aria-label={t('common.delete') || 'Delete'}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
