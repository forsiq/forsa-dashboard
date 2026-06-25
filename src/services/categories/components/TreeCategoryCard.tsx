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
import { CategoryTreeGuides } from './CategoryTreeGuides';
import type { TreeNodeSharedProps } from './treeNodeSharedProps';

export function TreeCategoryCard({
  node,
  level,
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
  isLastSibling = true,
  ancestorContinues = [],
  issuesByCategoryId,
  onContextMenu,
  autoExpand = false,
}: TreeNodeSharedProps) {
  const hasChildren = Boolean(node.children?.length);
  const [expanded, setExpanded] = useState(autoExpand && hasChildren);

  useEffect(() => {
    if (autoExpand && hasChildren) setExpanded(true);
  }, [autoExpand, hasChildren, node.id]);
  const Icon = resolveCategoryTreeIcon(node, hasChildren, expanded);
  const nodeIssues = issuesByCategoryId?.get(String(node.id)) ?? [];

  return (
    <div className="space-y-2" onContextMenu={(e) => onContextMenu?.(e, node)}>
      <AmberCard className="!p-4 bg-[var(--color-obsidian-card)] border-[var(--color-border)] shadow-sm">
        <div className="flex items-start gap-1 min-w-0">
          <CategoryTreeGuides
            level={level}
            isLastSibling={isLastSibling}
            ancestorContinues={ancestorContinues}
          />
          <div className="flex items-center justify-center w-8 h-8 shrink-0 mt-0.5">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors text-zinc-muted"
                aria-expanded={expanded}
                aria-label={
                  expanded
                    ? t('common.collapse') || 'Collapse'
                    : t('common.expand') || 'Expand'
                }
              >
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    !expanded && (dir === 'rtl' ? 'rotate-90' : '-rotate-90'),
                  )}
                />
              </button>
            ) : (
              <span className="w-8 h-8 shrink-0" aria-hidden />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={cn(
                    'p-1.5 rounded-lg border shrink-0',
                    hasChildren
                      ? 'bg-brand/10 border-brand/20'
                      : 'bg-[var(--color-obsidian-hover)] border-[var(--color-border)]',
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4',
                      hasChildren ? 'text-brand' : 'text-zinc-muted',
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/categories/${node.id}`}
                    className={cn(
                      'text-sm tracking-tight line-clamp-2 break-words block hover:text-brand hover:underline underline-offset-2 decoration-brand/40 transition-colors',
                      level === 0 ? 'font-bold text-zinc-text' : 'font-medium text-zinc-text/80',
                    )}
                  >
                    {getLocalizedName(node, language)}
                  </Link>
                  <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest line-clamp-2 break-words mt-0.5">
                    {node.slug || '-'}
                  </p>
                  {nodeIssues.length > 0 && (
                    <CategoryIssueBadges issues={nodeIssues} t={t} className="mt-2" />
                  )}
                </div>
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

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-muted uppercase tracking-widest">
                <span>{t('category.products_count') || 'Products'}</span>
                <span className="text-zinc-text tabular-nums">{node.productCount || 0}</span>
                {hasChildren && (
                  <span className="text-[10px] font-bold text-zinc-muted bg-white/[0.04] px-2 py-0.5 rounded-full normal-case">
                    {node.children!.length}
                  </span>
                )}
              </div>
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
          </div>
        </div>
      </AmberCard>

      {expanded &&
        hasChildren &&
        node.children!.map((child, index) => (
          <TreeCategoryCard
            key={child.id}
            node={child}
            level={level + 1}
            isLastSibling={index === node.children!.length - 1}
            ancestorContinues={[...ancestorContinues, !isLastSibling]}
            language={language}
            dir={dir}
            canManage={canManage}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onAddChild={onAddChild}
            onAddSibling={onAddSibling}
            openConfirm={openConfirm}
            t={t}
            issuesByCategoryId={issuesByCategoryId}
            onContextMenu={onContextMenu}
            autoExpand={autoExpand}
          />
        ))}
    </div>
  );
}
