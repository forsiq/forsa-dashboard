import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Plus, Search, LayoutGrid, Edit, Trash2, Activity, Ban, Layers, Power, PowerOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberCard } from '@core/components/AmberCard';
import { AmberTableSkeleton } from '@core/components/Loading/AmberTableSkeleton';
import { DataTable } from '@core/components/Data/DataTable';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { StatsGrid } from '@core/components/Layout/StatsGrid';
import { getIconByName } from '@core/components/IconPicker';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useDebounce } from '@core/hooks/useDebounce';
import { useGetCategories, useGetCategoryStats, useDeleteCategoryMutation, useUpdateCategoryMutation } from '../hooks';
import type { Category } from '../types';
import { getLocalizedName, getLocalizedDescription } from '../types';

// Stats are now handled by StatsGrid component

/**
 * CategoriesPage - Main categories list page
 */
export function CategoriesPage() {
  const { t, dir, language } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [isClient, setIsClient] = useState(false);
  const { openConfirm, ConfirmModal } = useConfirmModal();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch all categories (backend does not support search/isActive filtering yet)
  const { data, isLoading, error, refetch } = useGetCategories({
    page: 1,
    limit: 50,
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
        c.name?.toLowerCase().includes(query) ||
        c.slug?.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      );
    }

    return categories;
  }, [data?.categories, statusFilter, debouncedSearch, language]);

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useGetCategoryStats();

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

  const handleDelete = (id: string, name: string) => {
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
            handleDelete(category.id, category.name);
          },
        });
      },
    },
  ];

  if (!isClient) return null;

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 text-start">
        <div className="space-y-1 text-start">
          <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
            {t('category.title') || 'الفئات'}
          </h1>
          <p className="text-base text-zinc-secondary font-bold">
            {t('category.subtitle') || 'عرض وإدارة جميع فئات المنتجات في الكتالوج'}
          </p>
        </div>
        <Link href="/categories/new" className="flex-shrink-0">
          <AmberButton className="gap-2 px-6 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none">
            <span>{t('category.add_new') || 'إضافة فئة جديدة'}</span>
            <Plus className="w-5 h-5" />
          </AmberButton>
        </Link>
      </div>

      {/* Statistics Grid */}
      <StatsGrid
        stats={[
          {
            label: t('category.total') || 'Total Categories',
            value: stats?.total ?? 0,
            icon: LayoutGrid,
            color: 'warning',
          },
          {
            label: t('category.active') || 'Active',
            value: stats?.active ?? 0,
            icon: Activity,
            color: 'success',
          },
          {
            label: t('category.inactive') || 'Inactive',
            value: stats?.inactive ?? 0,
            icon: Ban,
            color: 'danger',
          },
          {
            label: t('category.main') || 'Main Categories',
            value: stats?.withParent ?? 0,
            icon: Layers,
            color: 'info',
          },
        ]}
      />

      <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
        {/* Status Tabs */}
        <div className="flex items-center bg-[var(--color-obsidian-card)] border border-[var(--color-border)] p-1.5 rounded-xl shadow-sm">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-6 py-2.5 text-sm font-bold transition-colors rounded-lg',
              statusFilter === 'all'
                ? 'bg-[var(--color-brand)] text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-black/5'
            )}
          >
            {t('common.all') || 'الكل'}
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={cn(
              'px-6 py-2.5 text-sm font-bold transition-colors rounded-lg',
              statusFilter === 'active'
                ? 'bg-[var(--color-brand)] text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-black/5'
            )}
          >
            {t('status.active') || 'نشط'}
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={cn(
              'px-6 py-2.5 text-sm font-bold transition-colors rounded-lg',
              statusFilter === 'inactive'
                ? 'bg-[var(--color-brand)] text-black shadow-sm'
                : 'text-zinc-muted hover:text-zinc-text hover:bg-black/5'
            )}
          >
            {t('status.inactive') || 'غير نشط'}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm w-full">
          <Search className={cn(
            'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted',
            dir === 'rtl' ? 'start-3' : 'end-3'
          )} />
          <AmberInput
            placeholder={t('category.search_placeholder') || 'البحث عن فئة...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "bg-[var(--color-obsidian-card)] border-[var(--color-border)] shadow-sm rounded-xl h-11 focus:ring-[var(--color-brand)]/20",
              dir === 'rtl' ? 'ps-10 pe-4 text-end' : 'pe-10 ps-4 text-start'
            )}
          />
        </div>
      </div>

      {/* Categories Table Container */}
      <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <AmberTableSkeleton rows={8} columns={6} hasActions />
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
        ) : (
          <DataTable
            columns={columns}
            data={filteredCategories}
            keyField="id"
            sortable
            selectable
            rowActions={rowActions}
            pagination
            pageSize={10}
            showViewToggle
          />
        )}
      </div>

      <ConfirmModal />
    </div>
  );
}

export default CategoriesPage;
