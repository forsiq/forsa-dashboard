import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';
import { AmberCard } from '@core/components/AmberCard';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import type { CategoryTreeNode } from '../types';
import { getLocalizedName } from '../types';
import { resolveCategoryTreeIcon } from '../lib';
import { CategoryIssueBadges } from './CategoryIssueBadges';
import { CategoryRowActions } from './CategoryRowActions';
import type { TreeNodeSharedProps } from './treeNodeSharedProps';

type CategoryGridCardProps = Omit<
  TreeNodeSharedProps,
  'level' | 'canReorder' | 'showDragHandle' | 'isLastSibling' | 'ancestorContinues'
>;

export function CategoryGridCard({
  node,
  language,
  dir,
  canManage,
  onEdit,
  onToggleStatus,
  onDelete,
  onAddChild,
  onAddSibling,
  openConfirm,
  t,
  issuesByCategoryId,
  onContextMenu,
  autoExpand = false,
}: CategoryGridCardProps) {
  const hasChildren = Boolean(node.children?.length);
  const [expanded, setExpanded] = useState(autoExpand && hasChildren);

  useEffect(() => {
    if (autoExpand && hasChildren) setExpanded(true);
  }, [autoExpand, hasChildren, node.id]);
  const Icon = resolveCategoryTreeIcon(node, hasChildren, expanded);
  const nodeIssues = issuesByCategoryId?.get(String(node.id)) ?? [];

  return (
    <div className="h-full" onContextMenu={(e) => onContextMenu?.(e, node)}>
      <AmberCard className="!p-0 h-full flex flex-col bg-[var(--color-obsidian-card)] border-[var(--color-border)] shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col gap-3 flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div
              className={cn(
                'p-3 rounded-xl border shrink-0',
                hasChildren
                  ? 'bg-brand/10 border-brand/20'
                  : 'bg-[var(--color-obsidian-hover)] border-[var(--color-border)]',
              )}
            >
              <Icon
                className={cn(
                  'w-6 h-6',
                  hasChildren ? 'text-brand' : 'text-zinc-muted',
                )}
              />
            </div>
            <StatusBadge
              status={
                node.isActive
                  ? t('category.active') || 'Active'
                  : t('category.inactive') || 'Inactive'
              }
              variant={node.isActive ? 'success' : 'inactive'}
              size="sm"
            />
          </div>

          <div className="min-w-0 space-y-1">
            <Link
              href={`/categories/${node.id}`}
              className="text-sm font-bold text-zinc-text tracking-tight line-clamp-2 break-words block hover:text-brand hover:underline underline-offset-2 decoration-brand/40 transition-colors"
            >
              {getLocalizedName(node, language)}
            </Link>
            <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest line-clamp-1 break-all">
              {node.slug || '-'}
            </p>
          </div>

          {nodeIssues.length > 0 && (
            <CategoryIssueBadges issues={nodeIssues} t={t} className="flex-wrap" />
          )}

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-zinc-muted uppercase tracking-widest">
            <span className="inline-flex items-center gap-1.5">
              {t('category.products_count') || 'Products'}
              <span className="text-zinc-text tabular-nums">{node.productCount || 0}</span>
            </span>
            {hasChildren && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-zinc-muted bg-white/[0.04] px-2 py-0.5 rounded-full normal-case">
                {node.children!.length}{' '}
                {t('category.subcategories') || 'subcategories'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-[var(--color-border)] bg-black/[0.02]">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-muted hover:text-brand transition-colors"
              aria-expanded={expanded}
            >
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 transition-transform duration-200',
                  !expanded && (dir === 'rtl' ? 'rotate-90' : '-rotate-90'),
                )}
              />
              {expanded
                ? t('common.collapse') || 'Collapse'
                : t('common.expand') || 'Expand'}
            </button>
          ) : (
            <span aria-hidden className="w-px" />
          )}
          <CategoryRowActions
            node={node}
            language={language}
            canManage={canManage}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onAddChild={onAddChild}
            onAddSibling={onAddSibling}
            openConfirm={openConfirm}
            t={t}
          />
        </div>

        {expanded && hasChildren && (
          <div className="px-4 pb-4 space-y-2 border-t border-[var(--color-border)] bg-black/[0.02]">
            {node.children!.map((child) => {
              const ChildIcon = resolveCategoryTreeIcon(child, Boolean(child.children?.length), false);
              const childIssues = issuesByCategoryId?.get(String(child.id)) ?? [];
              return (
                <div
                  key={child.id}
                  className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-obsidian-card)] px-3 py-2"
                  onContextMenu={(e) => onContextMenu?.(e, child)}
                >
                  <ChildIcon className="w-4 h-4 shrink-0 text-zinc-muted" />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/categories/${child.id}`}
                      className="text-xs font-bold text-zinc-text line-clamp-1 hover:text-brand transition-colors"
                    >
                      {getLocalizedName(child, language)}
                    </Link>
                    {childIssues.length > 0 && (
                      <CategoryIssueBadges issues={childIssues} t={t} compact className="mt-1" />
                    )}
                  </div>
                  <StatusBadge
                    status={
                      child.isActive
                        ? t('category.active') || 'Active'
                        : t('category.inactive') || 'Inactive'
                    }
                    variant={child.isActive ? 'success' : 'inactive'}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>
        )}
      </AmberCard>
    </div>
  );
}
