import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Search, LayoutGrid, Edit, Trash2, Activity, Ban, Layers, Power, PowerOff } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';
import { DataTable } from '@core/components/Data/DataTable';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { getIconByName } from '@core/components/IconPicker';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useDebounce } from '@core/hooks/useDebounce';
import { useGetCategories, useGetCategoryStats, useDeleteCategoryMutation, useUpdateCategoryMutation } from '../hooks';
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

/**
 * CategoriesPage - Main categories list page
 */
export function CategoriesPage() {
  const { t, dir, language } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusTab>('all');
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [sortBy, setSortBy] = useState<string>('sortOrder');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const isClient = useIsClient();
  const { openConfirm, ConfirmModal } = useConfirmModal();

  // Fetch all categories (backend does not support search/isActive filtering yet)
  const { data, isPending, isFetching, error, refetch } = useGetCategories({
    page: 1,
    limit: 100,
  });

  // Client-side filtering since backend ignores search/isActive params
  const filteredCategories = React.useMemo(() => {
    let categories = data?.categories || [];

    if (statusFilter !== 'all') {
      const wantActive = statusFilter === 'active';
      categories = categories.filter((c: Category) => c.isActive === wantActive);
    }

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      categories = categories.filter((c: Category) =>
        getLocalizedName(c, language)?.toLowerCase().includes(query) ||
        c.slug?.toLowerCase().includes(query) ||
        getLocalizedDescription(c, language)?.toLowerCase().includes(query)
      );
    }

    // Client-side sorting
    categories.sort((a: Category, b: Category) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return categories;
  }, [data?.categories, statusFilter, debouncedSearch, language, sortBy, sortOrder]);

  // Fetch stats
  const { data: stats, isPending: statsLoading } = useGetCategoryStats();

  // Delete mutation
  const deleteMutation = useDeleteCategoryMutation({
    onSuccess: () => {
      alert(t('category.deleted') || 'Category deleted successfully');
      refetch();
    },
    onError: (err) => {
      alert(err.message || t('category.delete_error') || 'Failed to delete category');
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (category: Category) => {
    router.push(`/categories/${category.id}/edit`);
  };

  // Toggle category active status
  const updateMutation = useUpdateCategoryMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleToggleStatus = (category: Category) => {
    const newStatus = !category.isActive;
    const statusText = newStatus
      ? (t('category.activated') || 'مفعّلة')
      : (t('category.deactivated') || 'معطّلة');

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

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortBy(key);
    setSortOrder(direction);
    setPage(1);
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
            selectedIds.forEach(id => {
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
            selectedIds.forEach(id => {
              updateMutation.mutate({ id, isActive: false });
            });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
          },
        });
      },
    },
  ];

  // Table columns
  const columns = [
    {
      key: 'name',
      label: t('category.name') || 'Name',
      cardTitle: true,
      render: (category: Category) => {
        const IconComponent = category.icon ? getIconByName(category.icon) : null;
        const Icon = IconComponent || LayoutGrid;
        return (
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-[var(--color-obsidian-hover)] border border-[var(--color-border)]">
              <Icon className="w-4 h-4 text-zinc-muted" />
            </div>
            <span className="text-sm font-bold text-zinc-text tracking-tight">
              {getLocalizedName(category, language)}
            </span>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'slug',
      label: t('category.slug') || 'Slug',
      hideInCard: true,
      render: (category: Category) => (
        <span className="text-sm text-zinc-text font-medium uppercase tracking-tight">
          {category.slug || '-'}
        </span>
      ),
    },
    {
      key: 'productCount',
      label: t('category.products_count') || 'Products',
      render: (category: Category) => (
        <span className="text-sm text-zinc-text font-bold">
          {category.productCount || 0}
        </span>
      ),
      align: 'center' as const,
    },
    {
      key: 'status',
      label: t('category.status') || 'Status',
      cardBadge: true,
      render: (category: Category) => (
        <StatusBadge
          status={category.isActive ? (t('category.active') || 'Active') : (t('category.inactive') || 'Inactive')}
          variant={category.isActive ? 'success' : 'inactive'}
          size="sm"
        />
      ),
      align: 'center' as const,
    },
    {
      key: 'sortOrder',
      label: t('category.order') || 'Order',
      render: (category: Category) => (
        <span className="text-sm text-zinc-text font-bold">
          {category.sortOrder ?? 0}
        </span>
      ),
      align: 'center' as const,
    },
  ];

  const rowActions = [
    {
      label: t('common.edit') || 'تعديل',
      icon: Edit,
      onClick: (category: Category) => handleEdit(category),
    },
    {
      label: (category: Category) => category.isActive
        ? (t('category.deactivate') || 'تعطيل')
        : (t('category.activate') || 'تفعيل'),
      icon: (category: Category) => category.isActive ? PowerOff : Power,
      onClick: (category: Category) => handleToggleStatus(category),
    },
    {
      label: t('common.delete') || 'حذف',
      icon: Trash2,
      variant: 'danger' as const,
      onClick: (category: Category) => {
        openConfirm({
          title: t('category.delete') || 'حذف الفئة',
          message: `${t('category.delete_confirm') || 'هل أنت متأكد من حذف هذه الفئة؟'}\n\n"${getLocalizedName(category, language)}"`,
          variant: 'destructive',
          onConfirm: () => {
            handleDelete(category.id);
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
        <AmberButton className="gap-2 px-6 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none" onClick={() => router.push('/categories/new')}>
            <span>{t('category.add_new') || 'إضافة فئة جديدة'}</span>
            <Plus className="w-5 h-5" />
        </AmberButton>
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
              onClick={() => { setStatusFilter(tab.key); setPage(1); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors whitespace-nowrap",
                statusFilter === tab.key
                  ? "bg-[var(--color-brand)] text-black shadow-sm"
                  : "text-zinc-muted hover:text-zinc-text hover:bg-black/5"
              )}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      }
      toolbar={
        <ListPageToolbar
          search={<ListPageToolbarSearch value={searchQuery} onChange={(v) => { setSearchQuery(v); setPage(1); }} placeholder={t('category.search_placeholder') || 'البحث عن فئة...'} />}
        />
      }
    >
      <div className="space-y-6">
        {isPending ? (
          <ListPageSkeleton count={8} columns={4} showStats />
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-danger font-bold">{t('category.error_loading') || 'حدث خطأ في تحميل الفئات'}</p>
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
            description={debouncedSearch
              ? (t('category.no_results') || 'No categories match your search.')
              : (t('category.empty_description') || 'No categories found.')
            }
            actionLabel={t('category.add_new') || 'Add Category'}
            onAction={() => router.push('/categories/new')}
          />
        ) : (
          <div className="relative bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
            {isFetching && <FetchingOverlay />}
            <DataTable
              columns={columns}
              data={filteredCategories}
              keyField="id"
              sortable
              selectable
              bulkActions={bulkActions}
              rowActions={rowActions}
              pagination
              pageSize={limit}
              currentPage={page}
              totalItems={filteredCategories.length}
              onPageChange={(newPage) => setPage(newPage)}
              showViewToggle
              onSortChange={handleSortChange}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          </div>
        )}
      </div>

      <ConfirmModal />
    </AdminListPageShell>
  );
}

export default CategoriesPage;
