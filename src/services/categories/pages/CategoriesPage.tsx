import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Plus,
  Search,
  LayoutGrid,
  Edit,
  Trash2,
  Activity,
  Ban,
  Layers,
  Power,
  PowerOff,
  GripVertical,
  Loader2,
  ChevronDown,
  Folder,
  FolderOpen,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';
import { AmberCard } from '@core/components/AmberCard';
import { AmberInput } from '@core/components/AmberInput';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { getIconByName } from '@core/components/IconPicker';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useDebounce } from '@core/hooks/useDebounce';
import {
  useGetCategoryStats,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  useReorderCategories,
  useCategoryHealthReport,
} from '../hooks';
import type { Category, CategoryTreeNode } from '../types';
import { getLocalizedName, getLocalizedDescription } from '../types';
import { buildCategoryTreeFromFlat, type CategoryIssue } from '../lib';
import { CategoryIssueBadges } from '../components/CategoryIssueBadges';
import { useIsClient } from '@core/hooks/useIsClient';
import { useDashboardRole } from '@core/hooks/useDashboardRole';
import {
  AdminListPageShell,
  ListPageToolbar,
  ListPageToolbarSearch,
} from '@core/components/Layout';
import { ListPageSkeleton, FetchingOverlay } from '@core/loading';
import { EmptyState } from '@core/components/EmptyState';
import { SuggestionReview } from '../components/SuggestionReview';

type StatusTab = 'all' | 'active' | 'inactive' | 'issues';
type PageTab = 'categories' | 'suggestions';

function nodeMatchesStatus(node: CategoryTreeNode, statusFilter: StatusTab): boolean {
  if (statusFilter === 'all') return true;
  const wantActive = statusFilter === 'active';
  return node.isActive === wantActive;
}

function nodeMatchesSearch(node: CategoryTreeNode, language: string, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    getLocalizedName(node, language)?.toLowerCase().includes(q) ||
    node.slug?.toLowerCase().includes(q) ||
    getLocalizedDescription(node, language)?.toLowerCase().includes(q) ||
    false
  );
}

function filterCategoryTree(
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

function filterIssuesTree(
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

function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const next = array.slice();
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
}

function findSiblingContext(
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

function reorderSiblingsInTree(
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
        children: orderedIds.map((id) => byId.get(id)).filter((c): c is CategoryTreeNode => Boolean(c)),
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

// --- Tree rows (desktop table + mobile cards) ---

const TREE_GUIDE_WIDTH = 22;

interface CategoryTreeGuidesProps {
  level: number;
  isLastSibling: boolean;
  ancestorContinues: boolean[];
}

/** Vertical/horizontal connectors for nested category rows (file-tree style). */
function CategoryTreeGuides({
  level,
  isLastSibling,
  ancestorContinues,
}: CategoryTreeGuidesProps) {
  if (level === 0) return null;

  return (
    <div className="flex items-stretch shrink-0 self-stretch min-h-8" aria-hidden>
      {ancestorContinues.map((showVertical, depth) => (
        <div
          key={`tree-pipe-${depth}`}
          className="relative shrink-0"
          style={{ width: TREE_GUIDE_WIDTH }}
        >
          {showVertical && (
            <span className="pointer-events-none absolute inset-y-0 start-2 w-px bg-white/15" />
          )}
        </div>
      ))}
      <div className="relative shrink-0" style={{ width: TREE_GUIDE_WIDTH }}>
        <span className="pointer-events-none absolute top-0 start-2 h-1/2 w-px bg-white/20" />
        <span className="pointer-events-none absolute top-1/2 start-2 end-0 h-px -translate-y-px bg-white/20" />
        {!isLastSibling && (
          <span className="pointer-events-none absolute bottom-0 top-1/2 start-2 w-px bg-white/20" />
        )}
        <span className="pointer-events-none absolute top-1/2 start-1.5 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-brand/50 ring-2 ring-brand/10" />
      </div>
    </div>
  );
}

function resolveCategoryTreeIcon(
  node: CategoryTreeNode,
  hasChildren: boolean,
  expanded: boolean,
): React.ComponentType<{ className?: string }> {
  const custom = node.icon ? getIconByName(node.icon) : null;
  if (custom) return custom;
  if (hasChildren) return expanded ? FolderOpen : Folder;
  return LayoutGrid;
}

interface TreeNodeSharedProps {
  node: CategoryTreeNode;
  level: number;
  language: string;
  dir: 'ltr' | 'rtl';
  canManage: boolean;
  onEdit: (category: Category) => void;
  onToggleStatus: (category: Category) => void;
  onDelete: (id: string) => void;
  openConfirm: (options: {
    title: string;
    message: string;
    variant?: 'default' | 'destructive' | 'warning';
    confirmText?: string;
    onConfirm: () => void;
  }) => void;
  t: (key: string) => string;
  canReorder?: boolean;
  isLastSibling?: boolean;
  ancestorContinues?: boolean[];
  issuesByCategoryId?: Map<string, CategoryIssue[]>;
}

function CategoryRowActions({
  node,
  language,
  canManage,
  onEdit,
  onToggleStatus,
  onDelete,
  openConfirm,
  t,
  className,
}: Pick<
  TreeNodeSharedProps,
  'node' | 'language' | 'canManage' | 'onEdit' | 'onToggleStatus' | 'onDelete' | 'openConfirm' | 't'
> & { className?: string }) {
  if (!canManage) return null;

  return (
    <div className={cn('flex items-center gap-1', className)}>
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

function TreeCategoryCard({
  node,
  level,
  language,
  dir,
  canManage,
  onEdit,
  onToggleStatus,
  onDelete,
  openConfirm,
  t,
  isLastSibling = true,
  ancestorContinues = [],
  issuesByCategoryId,
}: TreeNodeSharedProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = Boolean(node.children?.length);
  const Icon = resolveCategoryTreeIcon(node, hasChildren, expanded);
  const nodeIssues = issuesByCategoryId?.get(String(node.id)) ?? [];

  return (
    <div className="space-y-2">
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
                  <p
                    className={cn(
                      'text-sm tracking-tight truncate',
                      level === 0 ? 'font-bold text-zinc-text' : 'font-medium text-zinc-text/80',
                    )}
                  >
                    {getLocalizedName(node, language)}
                  </p>
                  <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest truncate mt-0.5">
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
            openConfirm={openConfirm}
            t={t}
            issuesByCategoryId={issuesByCategoryId}
          />
        ))}
    </div>
  );
}

function SortableTreeRow({
  node,
  level,
  language,
  dir,
  canManage,
  canReorder = false,
  onEdit,
  onToggleStatus,
  onDelete,
  openConfirm,
  t,
  isLastSibling = true,
  ancestorContinues = [],
  issuesByCategoryId,
}: TreeNodeSharedProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
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
        className={cn(
          'group transition-colors border-b border-white/[0.02] last:border-0 hover:bg-white/[0.02]',
          level > 0 && 'bg-white/[0.015]',
        )}
      >
        {/* Drag handle */}
        <td className="px-3 py-5 align-middle w-10">
          <div
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
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
        {/* Expand toggle — aligned with row content */}
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
        {/* Name */}
        <td className="px-4 py-5 align-middle">
          <div className="flex items-center gap-2 min-w-0">
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
            <span
              className={cn(
                'text-sm tracking-tight truncate',
                level === 0 ? 'font-bold text-zinc-text' : 'font-medium text-zinc-text/80',
              )}
            >
              {getLocalizedName(node, language)}
            </span>
            {hasChildren && (
              <span className="text-[10px] font-bold text-zinc-muted uppercase bg-white/[0.04] px-2 py-0.5 rounded-full shrink-0 tabular-nums">
                {node.children!.length}
              </span>
            )}
            {nodeIssues.length > 0 && (
              <CategoryIssueBadges issues={nodeIssues} t={t} compact />
            )}
          </div>
        </td>
        {/* Slug */}
        <td className="px-6 py-5">
          <span className="text-sm text-zinc-text font-medium uppercase tracking-tight">
            {node.slug || '-'}
          </span>
        </td>
        {/* Product Count */}
        <td className="px-6 py-5 text-[15px] font-bold text-zinc-text tracking-tight text-center">
          {node.productCount || 0}
        </td>
        {/* Status */}
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
        {/* Actions */}
        <td className="px-6 py-5">
          <CategoryRowActions
            node={node}
            language={language}
            canManage={canManage}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            openConfirm={openConfirm}
            t={t}
            className="justify-center"
          />
        </td>
      </tr>
      {/* Render children */}
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
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
              openConfirm={openConfirm}
              t={t}
              issuesByCategoryId={issuesByCategoryId}
            />
          ))}
        </SortableContext>
      )}
    </>
  );
}

export function CategoriesPage() {
  const { t, dir, language } = useLanguage();
  const { canManageCategories, canReviewCategorySuggestions } = useDashboardRole();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusTab>('all');
  const [pageTab, setPageTab] = useState<PageTab>('categories');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const isClient = useIsClient();
  const { openConfirm, ConfirmModal } = useConfirmModal();

  const {
    categories: flatCategories,
    report: healthReport,
    isPending: treeLoading,
    isFetching: treeFetching,
    error: treeError,
    refetch: refetchTree,
  } = useCategoryHealthReport(language);

  const categoryTree = useMemo(
    () => buildCategoryTreeFromFlat(flatCategories, language),
    [flatCategories, language],
  );

  const filteredTree = useMemo(() => {
    if (statusFilter === 'issues') {
      let tree = filterIssuesTree(categoryTree, healthReport.issuesByCategoryId);
      const search = (debouncedSearch ?? '').trim();
      if (search) {
        tree = filterCategoryTree(tree, language, 'all', search);
      }
      return tree;
    }
    return filterCategoryTree(
      categoryTree,
      language,
      statusFilter,
      debouncedSearch ?? '',
    );
  }, [categoryTree, language, statusFilter, debouncedSearch, healthReport.issuesByCategoryId]);

  const hasActiveFilters =
    statusFilter !== 'all' || Boolean((debouncedSearch ?? '').trim());

  const canReorder =
    canManageCategories &&
    statusFilter === 'all' &&
    !(debouncedSearch ?? '').trim();

  const [localTree, setLocalTree] = useState<CategoryTreeNode[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const displayTree = canReorder ? localTree : filteredTree;

  useEffect(() => {
    if (isSavingOrder) return;
    if (canReorder) {
      setLocalTree(categoryTree);
    }
  }, [categoryTree, canReorder, isSavingOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const reorderMutation = useReorderCategories({
    onSuccess: () => {
      void refetchTree();
    },
  });

  const persistSiblingOrder = useCallback(
    async (orderedIds: string[]) => {
      setIsSavingOrder(true);
      try {
        await reorderMutation.mutateAsync(orderedIds);
      } catch {
        setLocalTree(categoryTree);
      } finally {
        setIsSavingOrder(false);
      }
    },
    [reorderMutation, categoryTree],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!canReorder) return;
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeCtx = findSiblingContext(localTree, String(active.id));
      const overCtx = findSiblingContext(localTree, String(over.id));
      if (!activeCtx || !overCtx || activeCtx.parentId !== overCtx.parentId) return;

      const oldIndex = activeCtx.siblings.findIndex(
        (s) => String(s.id) === String(active.id),
      );
      const newIndex = activeCtx.siblings.findIndex(
        (s) => String(s.id) === String(over.id),
      );
      if (oldIndex < 0 || newIndex < 0) return;

      const reordered = arrayMove(activeCtx.siblings, oldIndex, newIndex);
      const orderedIds = reordered.map((s) => String(s.id));
      setLocalTree((prev) =>
        reorderSiblingsInTree(prev, activeCtx.parentId, orderedIds),
      );
      void persistSiblingOrder(orderedIds);
    },
    [canReorder, localTree, persistSiblingOrder],
  );

  // Fetch stats
  const { data: stats, isPending: statsLoading } = useGetCategoryStats();

  // Delete mutation
  const deleteMutation = useDeleteCategoryMutation({
    onSuccess: () => {
      void refetchTree();
    },
    onError: (err) => {
      alert(err.message || t('category.delete_error') || 'Failed to delete category');
    },
  });

  const updateMutation = useUpdateCategoryMutation();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (category: Category) => {
    router.push(`/categories/${category.id}/edit`);
  };

  const handleToggleStatus = (category: Category) => {
    const newStatus = !category.isActive;
    const statusText = newStatus
      ? t('category.activated') || 'مفعّلة'
      : t('category.deactivated') || 'معطّلة';

    openConfirm({
      title: t('category.status') || 'تغيير الحالة',
      message: `${t('category.toggle_status_confirm') || 'هل تريد تغيير حالة الفئة إلى'} ${statusText}?\n\n"${getLocalizedName(category, language)}"`,
      variant: 'warning',
      confirmText: statusText,
      onConfirm: () => {
        updateMutation.mutate({ id: category.id, isActive: newStatus });
      },
    });
  };

  const STATUS_TABS: { key: StatusTab; labelKey: string }[] = [
    { key: 'all', labelKey: 'common.all' },
    { key: 'active', labelKey: 'status.active' },
    { key: 'inactive', labelKey: 'status.inactive' },
    ...(canManageCategories
      ? [{ key: 'issues' as StatusTab, labelKey: 'category.health.tab' }]
      : []),
  ];

  const pageTabs = useMemo(() => {
    const tabs: { key: PageTab; labelKey: string; icon: typeof LayoutGrid }[] = [
      { key: 'categories', labelKey: 'category.title', icon: LayoutGrid },
    ];
    if (canReviewCategorySuggestions) {
      tabs.push({ key: 'suggestions', labelKey: 'category.suggestions', icon: MessageSquare });
    }
    return tabs;
  }, [canReviewCategorySuggestions]);

  useEffect(() => {
    if (!canReviewCategorySuggestions && pageTab === 'suggestions') {
      setPageTab('categories');
    }
  }, [canReviewCategorySuggestions, pageTab]);

  if (!isClient) return null;

  return (
    <AdminListPageShell
      title={t('category.title') || 'الفئات'}
      description={t('category.subtitle') || 'عرض وإدارة جميع فئات المنتجات في الكتالوج'}
      icon={LayoutGrid}
      className="p-3 md:p-6 space-y-4 md:space-y-8"
      headerActions={
        canManageCategories ? (
        <div className="flex items-center gap-3">
          {isSavingOrder && (
            <span className="hidden md:flex items-center gap-2 text-xs font-bold text-zinc-muted uppercase tracking-widest">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              {t('category.saving_order') || t('common.saving') || 'جاري الحفظ...'}
            </span>
          )}
          <AmberButton
            className="gap-2 px-4 md:px-6 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none"
            onClick={() => router.push('/categories/new')}
          >
            <span className="hidden md:inline">{t('category.add_new') || 'إضافة فئة جديدة'}</span>
            <Plus className="w-5 h-5" />
          </AmberButton>
        </div>
        ) : undefined
      }
      statsLoading={statsLoading}
      stats={[
        { label: t('category.total') || 'Total Categories', value: stats?.total ?? 0, icon: LayoutGrid, color: 'warning' },
        { label: t('category.active') || 'Active', value: stats?.active ?? 0, icon: Activity, color: 'success' },
        { label: t('category.inactive') || 'Inactive', value: stats?.inactive ?? 0, icon: Ban, color: 'danger' },
        { label: t('category.main') || 'Main Categories', value: stats?.withoutParent ?? 0, icon: Layers, color: 'info' },
        ...(canManageCategories && healthReport.totalAffected > 0
          ? [{
              label: t('category.health.stat') || 'Need review',
              value: healthReport.totalAffected,
              icon: AlertTriangle,
              color: 'warning' as const,
            }]
          : []),
      ]}
      tabs={
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
          {/* Page Tabs */}
          <div className="flex items-center gap-1 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] p-1.5 rounded-xl shadow-sm overflow-x-auto scrollbar-hide">
            {pageTabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setPageTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors whitespace-nowrap',
                    pageTab === tab.key
                      ? 'bg-[var(--color-brand)] text-black shadow-sm'
                      : 'text-zinc-muted hover:text-zinc-text hover:bg-black/5',
                  )}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {t(tab.labelKey)}
                </button>
              );
            })}
          </div>

          {/* Status filter */}
          {pageTab === 'categories' && (
            <div className="flex items-center gap-1 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] p-1.5 rounded-xl shadow-sm overflow-x-auto scrollbar-hide">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors whitespace-nowrap',
                    statusFilter === tab.key
                      ? tab.key === 'issues'
                        ? 'bg-warning text-black shadow-sm'
                        : 'bg-[var(--color-brand)] text-black shadow-sm'
                      : 'text-zinc-muted hover:text-zinc-text hover:bg-black/5',
                  )}
                >
                  {tab.key === 'issues' && (
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  {t(tab.labelKey)}
                  {tab.key === 'issues' && healthReport.totalAffected > 0 && (
                    <span
                      className={cn(
                        'min-w-[1.25rem] px-1.5 py-0.5 rounded-full text-[10px] font-black tabular-nums leading-none',
                        statusFilter === 'issues'
                          ? 'bg-black/15 text-black'
                          : 'bg-warning/20 text-warning',
                      )}
                    >
                      {healthReport.totalAffected}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      }
      toolbar={
        <ListPageToolbar
          search={
            <ListPageToolbarSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('category.search_placeholder') || 'البحث عن فئة...'}
            />
          }
        />
      }
    >
      <div className="space-y-6">
        {/* Suggestions Tab */}
        {pageTab === 'suggestions' ? (
          <SuggestionReview />
        ) : treeLoading ? (
            <ListPageSkeleton count={6} columns={4} showStats />
          ) : treeError ? (
            <div className="p-12 text-center">
              <p className="text-danger font-bold">
                {t('category.error_loading') || 'Error loading categories'}
              </p>
              <AmberButton
                variant="outline"
                size="sm"
                onClick={() => refetchTree()}
                className="mt-6 font-bold"
              >
                {t('common.retry') || 'Retry'}
              </AmberButton>
            </div>
          ) : !categoryTree.length ? (
            <EmptyState
              icon={LayoutGrid}
              title={t('category.empty') || 'No Categories'}
              description={t('category.empty_description') || 'No categories found.'}
              actionLabel={canManageCategories ? (t('category.add_new') || 'Add Category') : undefined}
              onAction={canManageCategories ? () => router.push('/categories/new') : undefined}
            />
          ) : filteredTree.length === 0 ? (
            <EmptyState
              icon={statusFilter === 'issues' ? AlertTriangle : LayoutGrid}
              title={
                statusFilter === 'issues'
                  ? t('category.health.empty') || 'No issues found'
                  : t('category.no_results') || 'No Categories'
              }
              description={
                statusFilter === 'issues'
                  ? t('category.health.empty_desc') ||
                    'All categories look healthy.'
                  : hasActiveFilters
                    ? t('category.no_results') || 'No categories match your filters.'
                    : t('category.empty_description') || 'No categories found.'
              }
            />
          ) : (
            <div className="relative bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
              {treeFetching && <FetchingOverlay />}
              {canManageCategories && healthReport.totalAffected > 0 && (
                <div
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 border-b',
                    statusFilter === 'issues'
                      ? 'border-warning/25 bg-warning/[0.08]'
                      : 'border-warning/20 bg-warning/5',
                  )}
                >
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-text">
                      {statusFilter === 'issues'
                        ? t('category.health.issues_context') ||
                          'Showing categories flagged for review.'
                        : (t('category.health.banner_title') || '{count} categories need review').replace(
                            '{count}',
                            String(healthReport.totalAffected),
                          )}
                    </p>
                    {statusFilter !== 'issues' && (
                      <>
                        <p className="text-xs text-zinc-muted mt-0.5">
                          {t('category.health.banner_desc') ||
                            'Detected duplicates, test data, product-like names, or missing metadata.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setStatusFilter('issues')}
                          className="mt-2 text-xs font-bold text-brand hover:underline"
                        >
                          {t('category.health.tab') || 'View issues'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-col">
                {/* Mobile: card tree */}
                <div className="md:hidden p-3 space-y-2 min-h-[200px]">
                  {displayTree.map((node, index) => (
                    <TreeCategoryCard
                      key={node.id}
                      node={node}
                      level={0}
                      isLastSibling={index === displayTree.length - 1}
                      ancestorContinues={[]}
                      language={language}
                      dir={dir}
                      canManage={canManageCategories}
                      onEdit={handleEdit}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDelete}
                      openConfirm={openConfirm}
                      t={t}
                      issuesByCategoryId={healthReport.issuesByCategoryId}
                    />
                  ))}
                </div>

                {/* Desktop: table tree with drag-and-drop reorder */}
                <div className="hidden md:block flex-1 min-h-[200px] overflow-x-auto">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    {canManageCategories && !canReorder && (
                      <p className="px-4 py-2 text-[10px] font-bold text-zinc-muted uppercase tracking-widest border-b border-white/5 bg-white/[0.02]">
                        {t('category.reorder_requires_full_list') ||
                          'امسح البحث واختر «الكل» لإعادة ترتيب الفئات'}
                      </p>
                    )}
                    <table className="w-full text-start border-collapse min-w-[800px]">
                      <thead className="bg-obsidian-outer/50 border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                          <th className="px-3 py-5 w-10" />
                          <th className="px-3 py-5 w-10" />
                          <th className="px-6 py-5 text-[11px] font-black text-zinc-muted uppercase tracking-widest select-none group text-start">
                            {t('category.name') || 'Name'}
                          </th>
                          <th className="px-6 py-5 text-[11px] font-black text-zinc-muted uppercase tracking-widest select-none group text-start">
                            {t('category.slug') || 'Slug'}
                          </th>
                          <th className="px-6 py-5 text-[11px] font-black text-zinc-muted uppercase tracking-widest select-none group text-center">
                            {t('category.products_count') || 'Products'}
                          </th>
                          <th className="px-6 py-5 text-[11px] font-black text-zinc-muted uppercase tracking-widest select-none group text-center">
                            {t('category.status') || 'Status'}
                          </th>
                          <th className="px-6 py-5 text-[11px] font-black text-zinc-muted uppercase tracking-widest select-none group text-center">
                            {t('common.actions') || 'Actions'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        <SortableContext
                          items={displayTree.map((n) => n.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {displayTree.map((node, index) => (
                            <SortableTreeRow
                              key={node.id}
                              node={node}
                              level={0}
                              isLastSibling={index === displayTree.length - 1}
                              ancestorContinues={[]}
                              language={language}
                              dir={dir}
                              canManage={canManageCategories}
                              canReorder={canReorder}
                              onEdit={handleEdit}
                              onToggleStatus={handleToggleStatus}
                              onDelete={handleDelete}
                              openConfirm={openConfirm}
                              t={t}
                              issuesByCategoryId={healthReport.issuesByCategoryId}
                            />
                          ))}
                        </SortableContext>
                      </tbody>
                    </table>
                  </DndContext>
                </div>
              </div>
            </div>
          )
        }
      </div>

      <ConfirmModal />
    </AdminListPageShell>
  );
}

export default CategoriesPage;
