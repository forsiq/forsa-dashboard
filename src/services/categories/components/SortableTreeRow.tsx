import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, GripVertical } from 'lucide-react';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@core/lib/utils/cn';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import type { CategoryTreeNode } from '../types';
import { getLocalizedName } from '../types';
import { resolveCategoryTreeIcon } from '../lib';
import { CategoryIssueBadges } from './CategoryIssueBadges';
import { CategoryRowActions } from './CategoryRowActions';
import { CategoryTreeGuides } from './CategoryTreeGuides';
import type { TreeNodeSharedProps } from './treeNodeSharedProps';

export function SortableTreeRow({
  node,
  level,
  language,
  dir,
  canManage,
  canReorder = false,
  showDragHandle = false,
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
  const hasChildren = node.children && node.children.length > 0;
  const [expanded, setExpanded] = useState(Boolean(autoExpand && hasChildren));

  useEffect(() => {
    if (autoExpand && hasChildren) setExpanded(true);
  }, [autoExpand, hasChildren, node.id]);

  const Icon = resolveCategoryTreeIcon(node, Boolean(hasChildren), expanded);
  const nodeIssues = issuesByCategoryId?.get(String(node.id)) ?? [];

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id, disabled: !canReorder });

  const rowStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <>
      <tr
        ref={setNodeRef}
        style={rowStyle}
        onContextMenu={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('[data-dnd-handle]')) return;
          onContextMenu?.(e, node);
        }}
        className={cn(
          'group transition-colors border-b border-white/[0.02] last:border-0 hover:bg-white/[0.02]',
          level > 0 && 'bg-white/[0.015]',
        )}
      >
        {showDragHandle && (
          <td className="px-3 py-5 align-middle w-10">
            <div
              ref={setActivatorNodeRef}
              data-dnd-handle=""
              {...(canReorder ? { ...attributes, ...listeners } : {})}
              className={cn(
                'flex items-center justify-center w-8 h-8 text-zinc-muted/30 transition-colors',
                canReorder
                  ? 'cursor-grab active:cursor-grabbing hover:text-zinc-muted'
                  : 'cursor-not-allowed opacity-40',
              )}
              aria-hidden={!canReorder}
            >
              <GripVertical className="w-4 h-4" />
            </div>
          </td>
        )}
        <td className="px-3 py-5 align-middle w-10">
          <div className="flex items-center justify-center w-8 h-8">
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
        </td>
        <td className="px-4 py-5 align-top min-w-[220px] w-[32%]">
          <div className="flex items-start gap-2 w-full min-w-0">
            <CategoryTreeGuides
              level={level}
              isLastSibling={isLastSibling}
              ancestorContinues={ancestorContinues}
            />
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
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <Link
                  href={`/categories/${node.id}`}
                  className={cn(
                    'text-sm tracking-tight break-words whitespace-normal min-w-0 hover:text-brand hover:underline underline-offset-2 decoration-brand/40 transition-colors',
                    level === 0 ? 'font-bold text-zinc-text' : 'font-medium text-zinc-text/80',
                  )}
                >
                  {getLocalizedName(node, language)}
                </Link>
                {hasChildren && (
                  <span className="text-[10px] font-bold text-zinc-muted uppercase bg-white/[0.04] px-2 py-0.5 rounded-full shrink-0 tabular-nums">
                    {node.children!.length}
                  </span>
                )}
              </div>
              {nodeIssues.length > 0 && (
                <CategoryIssueBadges issues={nodeIssues} t={t} compact />
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-5">
          <span className="text-sm text-zinc-text font-medium uppercase tracking-tight">
            {node.slug || '-'}
          </span>
        </td>
        <td className="px-6 py-5 text-[15px] font-bold text-zinc-text tracking-tight text-center">
          {node.productCount || 0}
        </td>
        <td className="px-6 py-5 text-center">
          <StatusBadge
            status={
              node.isActive
                ? t('category.active') || 'Active'
                : t('category.inactive') || 'Inactive'
            }
            variant={node.isActive ? 'success' : 'inactive'}
            size="sm"
          />
        </td>
        <td className="px-6 py-5">
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
            className="justify-center"
          />
        </td>
      </tr>
      {expanded && hasChildren && (
        <SortableContext
          items={node.children!.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {node.children!.map((child, index) => (
            <SortableTreeRow
              key={child.id}
              node={child}
              level={level + 1}
              isLastSibling={index === node.children!.length - 1}
              ancestorContinues={[...ancestorContinues, !isLastSibling]}
              language={language}
              dir={dir}
              canManage={canManage}
              canReorder={canReorder}
              showDragHandle={showDragHandle}
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
        </SortableContext>
      )}
    </>
  );
}
