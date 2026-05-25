import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
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
import { AmberInput } from '@core/components/AmberInput';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { getIconByName } from '@core/components/IconPicker';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useDebounce } from '@core/hooks/useDebounce';
import {
  useGetCategories,
  useGetCategoryStats,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  useReorderCategories,
} from '../hooks';
import type { Category } from '../types';
import { getLocalizedName, getLocalizedDescription } from '../types';
import { useIsClient } from '@core/hooks/useIsClient';
import {
  AdminListPageShell,
  ListPageToolbar,
  ListPageToolbarSearch,
} from '@core/components/Layout';
import { ListPageSkeleton, FetchingOverlay } from '@core/loading';
import { EmptyState } from '@core/components/EmptyState';

type StatusTab = 'all' | 'active' | 'inactive';

function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice();
  const [removed] = newArray.splice(from, 1);
  newArray.splice(to, 0, removed);
  return newArray;
}

interface SortableRowProps {
  id: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function SortableRow({ id, children, disabled = false }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 50 : 'auto' as const,
  };

  return (
    <tr ref={setNodeRef} style={style} className="group transition-colors border-b border-white/[0.02] last:border-0 hover:bg-white/[0.02]">
      {React.Children.map(children, (child, index) => {
        if (index === 0) {
          return React.cloneElement(child as React.ReactElement, { ...listeners });
        }
        return child;
      })}
    </tr>
  );
}

export function CategoriesPage() {
  const { t, dir, language } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusTab>('all');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [page, setPage] = useState(1);
  const limit = 50;
  const isClient = useIsClient();
  const { openConfirm, ConfirmModal } = useConfirmModal();

  // Drag & drop state (reorder only when full list is visible — not search/filter subset)
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const canReorder =
    statusFilter === 'all' && !(debouncedSearch ?? '').trim();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Fetch all categories
  const {
    data,
    isPending,
    isFetching,
    error,
    refetch,
  } = useGetCategories({ page: 1, limit: 100 });

  // Client-side filtering
  const filteredCategories = React.useMemo(() => {
    let categories = data?.categories || [];

    if (statusFilter !== 'all') {
      const wantActive = statusFilter === 'active';
      categories = categories.filter((c: Category) => c.isActive === wantActive);
    }

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      categories = categories.filter(
        (c: Category) =>
          getLocalizedName(c, language)?.toLowerCase().includes(query) ||
          c.slug?.toLowerCase().includes(query) ||
          getLocalizedDescription(c, language)?.toLowerCase().includes(query),
      );
    }

    // Sort by sortOrder by default
    categories.sort((a: Category, b: Category) => {
      const aVal = a.sortOrder ?? 0;
      const bVal = b.sortOrder ?? 0;
      return aVal - bVal;
    });

    return categories;
  }, [data?.categories, statusFilter, debouncedSearch, language]);

  // Sync local categories when server list changes (skip while saving drag order)
  useEffect(() => {
    if (isSavingOrder) return;
    setLocalCategories(filteredCategories);
  }, [filteredCategories, isSavingOrder]);

  // Fetch stats
  const { data: stats, isPending: statsLoading } = useGetCategoryStats();

  // Delete mutation
  const deleteMutation = useDeleteCategoryMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (err) => {
      alert(err.message || t('category.delete_error') || 'Failed to delete category');
    },
  });

  const updateMutation = useUpdateCategoryMutation();
  const reorderMutation = useReorderCategories();

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

  const persistCategoryOrder = async (ordered: Category[]) => {
    setIsSavingOrder(true);
    try {
      await reorderMutation.mutateAsync(ordered.map((c) => String(c.id)));
      await refetch();
    } catch {
      setLocalCategories(filteredCategories);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!canReorder) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localCategories.findIndex((c) => String(c.id) === String(active.id));
    const newIndex = localCategories.findIndex((c) => String(c.id) === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const nextOrder = arrayMove(localCategories, oldIndex, newIndex);
    setLocalCategories(nextOrder);
    void persistCategoryOrder(nextOrder);
  };

  const queryClient = useQueryClient();

  const bulkActions = [
    {
      label: t('category.bulk_activate') || 'Activate Selected',
      icon: Power,
      onClick: (selectedIds: string[]) => {
        openConfirm({
          title: t('category.bulk_activate') || 'Activate Selected',
          message: `${t('category.bulk_activate_confirm') || 'Are you sure you want to activate'} ${selectedIds.length} ${t('category.items') || 'items'}?`,
          variant: 'warning',
          onConfirm: () => {
            selectedIds.forEach((id) => {
              updateMutation.mutate({ id, isActive: true });
            });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
          },
        });
      },
    },
    {
      label: t('category.bulk_deactivate') || 'Deactivate Selected',
      icon: PowerOff,
      variant: 'danger' as const,
      onClick: (selectedIds: string[]) => {
        openConfirm({
          title: t('category.bulk_deactivate') || 'Deactivate Selected',
          message: `${t('category.bulk_deactivate_confirm') || 'Are you sure you want to deactivate'} ${selectedIds.length} ${t('category.items') || 'items'}?`,
          variant: 'destructive',
          onConfirm: () => {
            selectedIds.forEach((id) => {
              updateMutation.mutate({ id, isActive: false });
            });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
          },
        });
      },
    },
  ];

  const STATUS_TABS: { key: StatusTab; labelKey: string }[] = [
    { key: 'all', labelKey: 'common.all' },
    { key: 'active', labelKey: 'status.active' },
    { key: 'inactive', labelKey: 'status.inactive' },
  ];

  if (!isClient) return null;

  return (
    <AdminListPageShell
      title={t('category.title') || 'الفئات'}
      description={t('category.subtitle') || 'عرض وإدارة جميع فئات المنتجات في الكتالوج'}
      icon={LayoutGrid}
      headerActions={
        <div className="flex items-center gap-3">
          {isSavingOrder && (
            <span className="flex items-center gap-2 text-xs font-bold text-zinc-muted uppercase tracking-widest">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              {t('category.saving_order') || t('common.saving') || 'جاري الحفظ...'}
            </span>
          )}
          <AmberButton
            className="gap-2 px-6 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none"
            onClick={() => router.push('/categories/new')}
          >
            <span>{t('category.add_new') || 'إضافة فئة جديدة'}</span>
            <Plus className="w-5 h-5" />
          </AmberButton>
        </div>
      }
      statsLoading={statsLoading}
      stats={[
        { label: t('category.total') || 'Total Categories', value: stats?.total ?? 0, icon: LayoutGrid, color: 'warning' },
        { label: t('category.active') || 'Active', value: stats?.active ?? 0, icon: Activity, color: 'success' },
        { label: t('category.inactive') || 'Inactive', value: stats?.inactive ?? 0, icon: Ban, color: 'danger' },
        { label: t('category.main') || 'Main Categories', value: stats?.withParent ?? 0, icon: Layers, color: 'info' },
      ]}
      tabs={
        <div className="flex items-center gap-1 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] p-1.5 rounded-xl shadow-sm overflow-x-auto scrollbar-hide">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors whitespace-nowrap',
                statusFilter === tab.key
                  ? 'bg-[var(--color-brand)] text-black shadow-sm'
                  : 'text-zinc-muted hover:text-zinc-text hover:bg-black/5',
              )}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      }
      toolbar={
        <ListPageToolbar
          search={
            <ListPageToolbarSearch
              value={searchQuery}
              onChange={(v) => {
                setSearchQuery(v);
                setPage(1);
              }}
              placeholder={t('category.search_placeholder') || 'البحث عن فئة...'}
            />
          }
        />
      }
    >
      <div className="space-y-6">
        {isPending ? (
          <ListPageSkeleton count={8} columns={4} showStats />
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-danger font-bold">
              {t('category.error_loading') || 'حدث خطأ في تحميل الفئات'}
            </p>
            <AmberButton
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-6 font-bold"
            >
              {t('common.retry') || 'إعادة المحاولة'}
            </AmberButton>
          </div>
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            title={t('category.empty') || 'No Categories'}
            description={
              debouncedSearch
                ? t('category.no_results') || 'No categories match your search.'
                : t('category.empty_description') || 'No categories found.'
            }
            actionLabel={t('category.add_new') || 'Add Category'}
            onAction={() => router.push('/categories/new')}
          />
        ) : (
          <div className="relative bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
            {isFetching && <FetchingOverlay />}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              {!canReorder && (
                <p className="px-4 py-2 text-[10px] font-bold text-zinc-muted uppercase tracking-widest border-b border-white/5 bg-white/[0.02]">
                  {t('category.reorder_requires_full_list') ||
                    'امسح البحث واختر «الكل» لإعادة ترتيب الفئات'}
                </p>
              )}
              <SortableContext
                items={localCategories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col bg-obsidian-panel border border-white/5 rounded-lg shadow-sm">
                  <div className="flex-1 min-h-[200px] overflow-x-auto">
                    <table className="w-full text-start border-collapse min-w-[800px]">
                      <thead className="bg-obsidian-outer/50 border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
                        <tr>
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
                        {localCategories.map((category) => {
                          const IconComponent = category.icon
                            ? getIconByName(category.icon)
                            : null;
                          const Icon = IconComponent || LayoutGrid;

                          return (
                            <SortableRow key={category.id} id={category.id} disabled={!canReorder}>
                              {/* Drag handle cell - receives listeners from SortableRow */}
                              <td className="px-3 py-5">
                                <div
                                  className={cn(
                                    'text-zinc-muted/30 transition-colors',
                                    canReorder
                                      ? 'cursor-grab active:cursor-grabbing hover:text-zinc-muted'
                                      : 'cursor-not-allowed opacity-40',
                                  )}
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>
                              </td>
                              {/* Name */}
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="p-1.5 rounded-lg bg-[var(--color-obsidian-hover)] border border-[var(--color-border)]">
                                    <Icon className="w-4 h-4 text-zinc-muted" />
                                  </div>
                                  <span className="text-sm font-bold text-zinc-text tracking-tight">
                                    {getLocalizedName(category, language)}
                                  </span>
                                </div>
                              </td>
                              {/* Slug */}
                              <td className="px-6 py-5">
                                <span className="text-sm text-zinc-text font-medium uppercase tracking-tight">
                                  {category.slug || '-'}
                                </span>
                              </td>
                              {/* Product Count */}
                              <td className="px-6 py-5 text-[15px] font-bold text-zinc-text tracking-tight text-center">
                                {category.productCount || 0}
                              </td>
                              {/* Status */}
                              <td className="px-6 py-5 text-center">
                                <StatusBadge
                                  status={
                                    category.isActive
                                      ? t('category.active') || 'Active'
                                      : t('category.inactive') || 'Inactive'
                                  }
                                  variant={category.isActive ? 'success' : 'inactive'}
                                  size="sm"
                                />
                              </td>
                              {/* Actions */}
                              <td className="px-6 py-5">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleEdit(category)}
                                    className="p-2 rounded-lg text-zinc-muted hover:text-brand hover:bg-brand/10 transition-all"
                                    title={t('common.edit') || 'تعديل'}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleToggleStatus(category)}
                                    className={cn(
                                      'p-2 rounded-lg transition-all',
                                      category.isActive
                                        ? 'text-zinc-muted hover:text-warning hover:bg-warning/10'
                                        : 'text-zinc-muted hover:text-success hover:bg-success/10',
                                    )}
                                    title={
                                      category.isActive
                                        ? t('category.deactivate') || 'تعطيل'
                                        : t('category.activate') || 'تفعيل'
                                    }
                                  >
                                    {category.isActive ? (
                                      <PowerOff className="w-4 h-4" />
                                    ) : (
                                      <Power className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      openConfirm({
                                        title: t('category.delete') || 'حذف الفئة',
                                        message: `${t('category.delete_confirm') || 'هل أنت متأكد من حذف هذه الفئة؟'}\n\n"${getLocalizedName(category, language)}"`,
                                        variant: 'destructive',
                                        onConfirm: () => handleDelete(category.id),
                                      });
                                    }}
                                    className="p-2 rounded-lg text-zinc-muted hover:text-danger hover:bg-danger/10 transition-all"
                                    title={t('common.delete') || 'حذف'}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </SortableRow>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      <ConfirmModal />
    </AdminListPageShell>
  );
}

export default CategoriesPage;
