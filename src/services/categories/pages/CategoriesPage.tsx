import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  LayoutGrid,
  Activity,
  Ban,
  Layers,
  Loader2,
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
} from '@dnd-kit/sortable';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';
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
import { getLocalizedName } from '../types';
import { buildCategoryTreeFromFlat } from '../lib';
import {
  filterCategoryTree,
  filterIssuesTree,
  getCategoryTreeSignature,
  arrayMove,
  findSiblingContext,
  reorderSiblingsInTree,
  countTreeNodes,
  readStoredCategoryViewMode,
  type StatusTab,
  type CategoryViewMode,
} from '../lib';
import { CategoryAddModal } from '../components/CategoryAddModal';
import { CategoryEditModal } from '../components/CategoryEditModal';
import {
  CategoryRowContextMenu,
  useContextMenu,
  type ContextMenuAction,
} from '../components/CategoryRowContextMenu';
import { CategoryViewToggle } from '../components/CategoryViewToggle';
import { CategoryGridCard } from '../components/CategoryGridCard';
import { TreeCategoryCard } from '../components/TreeCategoryCard';
import { SortableTreeRow } from '../components/SortableTreeRow';
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

type PageTab = 'categories' | 'suggestions';

export function CategoriesPage() {
  const { t, dir, language } = useLanguage();
  const { canManageCategories, canReorderCategories, canReviewCategorySuggestions } = useDashboardRole();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusTab>('all');
  const [pageTab, setPageTab] = useState<PageTab>('categories');
  const [viewMode, setViewMode] = useState<CategoryViewMode>(() => readStoredCategoryViewMode());
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;
  const debouncedSearch = useDebounce(searchQuery, 300);
  const searchActive = Boolean((debouncedSearch ?? '').trim());
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

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearch]);

  const canReorder =
    canReorderCategories &&
    statusFilter === 'all' &&
    !(debouncedSearch ?? '').trim();

  const [localTree, setLocalTree] = useState<CategoryTreeNode[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const categoryTreeSignature = useMemo(
    () => getCategoryTreeSignature(categoryTree),
    [categoryTree],
  );

  const displayTree = canReorder ? localTree : filteredTree;

  const totalRoots = displayTree.length;
  const totalPages = Math.max(1, Math.ceil(totalRoots / PAGE_SIZE));
  const hidePagination = statusFilter === 'issues' || searchActive;
  const paginatedTree = hidePagination
    ? displayTree
    : displayTree.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pageFrom = hidePagination ? 1 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageTo = hidePagination ? totalRoots : Math.min(currentPage * PAGE_SIZE, totalRoots);
  const autoExpandTree = searchActive || statusFilter === 'issues';

  const visibleCategoryCount = useMemo(
    () => countTreeNodes(filteredTree),
    [filteredTree],
  );

  useEffect(() => {
    if (isSavingOrder || !canReorder) return;
    setLocalTree((prev) => {
      if (getCategoryTreeSignature(prev) === categoryTreeSignature) return prev;
      return categoryTree;
    });
  }, [categoryTree, categoryTreeSignature, canReorder, isSavingOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const reorderMutation = useReorderCategories();

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

  const { data: stats, isPending: statsLoading } = useGetCategoryStats();

  const deleteMutation = useDeleteCategoryMutation({
    onError: (err) => {
      alert(err.message || t('category.delete_error') || 'Failed to delete category');
    },
  });

  const updateMutation = useUpdateCategoryMutation();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addDefaultParentId, setAddDefaultParentId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();

  const handleEdit = useCallback((category: Category) => {
    setEditCategory(category);
    setEditModalOpen(true);
  }, []);

  const handleAddChild = useCallback((node: CategoryTreeNode) => {
    setAddDefaultParentId(String(node.id));
    setAddModalOpen(true);
  }, []);

  const handleAddSibling = useCallback((node: CategoryTreeNode) => {
    setAddDefaultParentId(node.parentId ? String(node.parentId) : null);
    setAddModalOpen(true);
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.add === '1') {
      setAddDefaultParentId(null);
      setAddModalOpen(true);
      void router.replace('/categories', undefined, { shallow: true });
    } else if (router.query.edit && typeof router.query.edit === 'string') {
      const found = flatCategories.find(
        (c) => String(c.id) === router.query.edit,
      );
      if (found) {
        setEditCategory(found);
        setEditModalOpen(true);
      }
      void router.replace('/categories', undefined, { shallow: true });
    }
  }, [router.isReady, router.query.add, router.query.edit, flatCategories]);

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

  const buildContextMenuActions = useCallback(
    (node: CategoryTreeNode): ContextMenuAction[] => {
      if (!canManageCategories) return [];
      const isMain = !node.parentId;
      return [
        {
          key: 'edit',
          label: t('common.edit') || 'Edit',
          icon: <Edit className="w-4 h-4" />,
          onClick: () => handleEdit(node),
        },
        {
          key: 'toggle',
          label: node.isActive
            ? t('category.deactivate') || 'Deactivate'
            : t('category.activate') || 'Activate',
          icon: node.isActive
            ? <PowerOff className="w-4 h-4" />
            : <Power className="w-4 h-4" />,
          onClick: () => handleToggleStatus(node),
        },
        ...(isMain
          ? [{
              key: 'add-sub',
              label: t('category.add_subcategory') || 'Add subcategory',
              icon: <Plus className="w-4 h-4" />,
              onClick: () => handleAddChild(node),
            }]
          : []),
        {
          key: 'add-sibling',
          label: t('category.add_sibling') || 'Add sibling',
          icon: <Plus className="w-3.5 h-3.5" />,
          onClick: () => handleAddSibling(node),
        },
        {
          key: 'delete',
          label: t('common.delete') || 'Delete',
          icon: <Trash2 className="w-4 h-4" />,
          onClick: () => {
            openConfirm({
              title: t('category.delete') || 'Delete Category',
              message: `${t('category.delete_confirm') || 'Are you sure?'}\n\n"${getLocalizedName(node, language)}"`,
              variant: 'destructive',
              onConfirm: () => handleDelete(node.id),
            });
          },
          variant: 'danger' as const,
        },
      ];
    },
    [canManageCategories, t, language, handleEdit, handleToggleStatus, handleAddChild, handleAddSibling, handleDelete, openConfirm],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, node: CategoryTreeNode) => {
      openContextMenu(e, buildContextMenuActions(node));
    },
    [openContextMenu, buildContextMenuActions],
  );

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

  const handleViewModeChange = useCallback((mode: CategoryViewMode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('forsa_categories_view_mode', mode);
    }
  }, []);

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
            onClick={() => { setAddDefaultParentId(null); setAddModalOpen(true); }}
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
        pageTab === 'categories' ? (
          <ListPageToolbar
            search={
              <ListPageToolbarSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t('category.search_placeholder') || 'البحث عن فئة...'}
              />
            }
            endActions={
              <CategoryViewToggle
                viewMode={viewMode}
                onChange={handleViewModeChange}
                t={t}
              />
            }
          />
        ) : undefined
      }
    >
      <div className="space-y-6">
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
              onAction={canManageCategories ? () => { setAddDefaultParentId(null); setAddModalOpen(true); } : undefined}
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
              {searchActive && (
                <p className="px-4 py-2 text-xs font-bold text-zinc-muted border-b border-white/5 bg-white/[0.02]">
                  {(t('category.search_results') || '{count} categories match your search').replace(
                    '{count}',
                    String(visibleCategoryCount),
                  )}
                </p>
              )}
              <div className="flex flex-col">
                <div className="md:hidden p-3 space-y-2 min-h-[200px]">
                  {paginatedTree.map((node, index) => (
                    <TreeCategoryCard
                      key={node.id}
                      node={node}
                      level={0}
                      isLastSibling={index === paginatedTree.length - 1}
                      ancestorContinues={[]}
                      language={language}
                      dir={dir}
                      canManage={canManageCategories}
                      onEdit={handleEdit}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDelete}
                      onAddChild={canManageCategories ? handleAddChild : undefined}
                      onAddSibling={canManageCategories ? handleAddSibling : undefined}
                      openConfirm={openConfirm}
                      t={t}
                      issuesByCategoryId={healthReport.issuesByCategoryId}
                      onContextMenu={canManageCategories ? handleContextMenu : undefined}
                      autoExpand={autoExpandTree}
                    />
                  ))}
                </div>

                {viewMode === 'grid' ? (
                  <div className="hidden md:block p-4 min-h-[200px]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {paginatedTree.map((node) => (
                        <CategoryGridCard
                          key={node.id}
                          node={node}
                          language={language}
                          dir={dir}
                          canManage={canManageCategories}
                          onEdit={handleEdit}
                          onToggleStatus={handleToggleStatus}
                          onDelete={handleDelete}
                          onAddChild={canManageCategories ? handleAddChild : undefined}
                          onAddSibling={canManageCategories ? handleAddSibling : undefined}
                          openConfirm={openConfirm}
                          t={t}
                          issuesByCategoryId={healthReport.issuesByCategoryId}
                          onContextMenu={canManageCategories ? handleContextMenu : undefined}
                          autoExpand={autoExpandTree}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                <div className="hidden md:block flex-1 min-h-[200px] overflow-x-auto">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    {canReorderCategories && !canReorder && (
                      <p className="px-4 py-2 text-[10px] font-bold text-zinc-muted uppercase tracking-widest border-b border-white/5 bg-white/[0.02]">
                        {t('category.reorder_requires_full_list') ||
                          'امسح البحث واختر «الكل» لإعادة ترتيب الفئات'}
                      </p>
                    )}
                    <table className="w-full text-start border-collapse min-w-[800px] table-fixed">
                      <thead className="bg-obsidian-outer/50 border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                          {canReorderCategories && <th className="px-3 py-5 w-10" />}
                          <th className="px-3 py-5 w-10" />
                          <th className="px-6 py-5 min-w-[220px] w-[32%] text-[11px] font-black text-zinc-muted uppercase tracking-widest select-none group text-start">
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
                          items={paginatedTree.map((n) => n.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {paginatedTree.map((node, index) => (
                            <SortableTreeRow
                              key={node.id}
                              node={node}
                              level={0}
                              isLastSibling={index === paginatedTree.length - 1}
                              ancestorContinues={[]}
                              language={language}
                              dir={dir}
                              canManage={canManageCategories}
                              canReorder={canReorder}
                              showDragHandle={canReorderCategories}
                              onEdit={handleEdit}
                              onToggleStatus={handleToggleStatus}
                              onDelete={handleDelete}
                              onAddChild={canManageCategories ? handleAddChild : undefined}
                              onAddSibling={canManageCategories ? handleAddSibling : undefined}
                              openConfirm={openConfirm}
                              t={t}
                              issuesByCategoryId={healthReport.issuesByCategoryId}
                              onContextMenu={canManageCategories ? handleContextMenu : undefined}
                              autoExpand={autoExpandTree}
                            />
                          ))}
                        </SortableContext>
                      </tbody>
                    </table>
                  </DndContext>
                </div>
                )}
                {!hidePagination && totalRoots > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-6 py-4 border-t border-white/5">
                    <span className="text-[11px] font-bold text-zinc-muted tabular-nums order-2 sm:order-1">
                      {(t('category.pagination_summary') || 'Showing {from}-{to} of {total} main categories')
                        .replace('{from}', String(pageFrom))
                        .replace('{to}', String(pageTo))
                        .replace('{total}', String(totalRoots))}
                    </span>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-3 order-1 sm:order-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage <= 1}
                          className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-obsidian-card border border-white/5 text-zinc-text disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                        >
                          {t('common.prev') || 'Prev'}
                        </button>
                        <span className="text-[11px] font-bold text-zinc-muted tabular-nums">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage >= totalPages}
                          className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-obsidian-card border border-white/5 text-zinc-text disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                        >
                          {t('common.next') || 'Next'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        }
      </div>

      <ConfirmModal />

      {canManageCategories && (
        <CategoryAddModal
          open={addModalOpen}
          onClose={() => { setAddModalOpen(false); setAddDefaultParentId(null); }}
          defaultParentId={addDefaultParentId}
          onSuccess={() => { setAddModalOpen(false); setAddDefaultParentId(null); }}
        />
      )}
      {editCategory && (
        <CategoryEditModal
          category={editCategory}
          open={editModalOpen}
          onClose={() => { setEditModalOpen(false); setEditCategory(null); }}
        />
      )}
      {contextMenu && (
        <CategoryRowContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          actions={contextMenu.actions}
          onClose={closeContextMenu}
        />
      )}
    </AdminListPageShell>
  );
}

export default CategoriesPage;
