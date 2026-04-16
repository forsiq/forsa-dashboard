import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Plus, Search, LayoutGrid, Edit, Trash2, Activity, Ban, Layers } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../../../core/contexts/LanguageContext';
import { cn } from '../../../core/lib/utils/cn';
import { AmberButton } from '../../../core/components/AmberButton';
import { AmberInput } from '../../../core/components/AmberInput';
import { AmberCard } from '../../../core/components/AmberCard';
import { AmberTableSkeleton } from '../../../core/components/Loading/AmberTableSkeleton';
import { DataTable } from '../../../core/components/Data/DataTable';
import { StatusBadge } from '../../../core/components/Data/StatusBadge';
import { useGetCategories, useGetCategoryStats, useDeleteCategoryMutation } from '../hooks';
import type { Category } from '../types';

// Simple debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Stats Card Component
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  className?: string;
  iconClassName?: string;
  isLoading?: boolean;
}

function StatCard({ label, value, icon: Icon, className, iconClassName, isLoading }: StatCardProps) {
  return (
    <AmberCard className={cn(
      "!p-5 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] shadow-sm hover:border-white/10 transition-all group overflow-hidden relative",
      className?.includes('text-') && className.split(' ').find(c => c.startsWith('text-'))
    )}>
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.15em] block">
            {label}
          </span>
          {isLoading ? (
            <div className="h-8 w-12 bg-zinc-card/50 rounded animate-pulse mt-1" />
          ) : (
            <span className="text-3xl font-black text-zinc-text tracking-tight tabular-nums leading-none">
              {value}
            </span>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg',
          className
        )}>
          <Icon className={cn('w-5 h-5', iconClassName)} />
        </div>
      </div>
      
      {/* Background Polish - Inherits color via bg-current */}
      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-current opacity-[0.05] rounded-full blur-3xl group-hover:opacity-[0.1] transition-all duration-500" />
    </AmberCard>
  );
}

/**
 * CategoriesPage - Main categories list page
 */
export function CategoriesPage() {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch categories - unwrap .data from response
  const { data, isLoading, error, refetch } = useGetCategories({
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page: 1,
    limit: 50,
  });

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

  // Table columns
  const columns = [
    {
      key: 'name',
      label: t('category.name') || 'Name',
      render: (category: Category) => (
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-[var(--color-obsidian-hover)] border border-[var(--color-border)]">
            <LayoutGrid className="w-4 h-4 text-zinc-muted" />
          </div>
          <span className="text-sm font-bold text-zinc-text tracking-tight uppercase">
            {category.name}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'slug',
      label: t('category.slug') || 'Slug',
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
      render: (category: Category) => (
        <StatusBadge
          status={category.status === 'active' ? (t('category.active') || 'Active') : (t('category.inactive') || 'Inactive')}
          variant={category.status === 'active' ? 'success' : 'inactive'}
          size="sm"
        />
      ),
      align: 'center' as const,
    },
    {
      key: 'order',
      label: t('category.order') || 'Order',
      render: (category: Category) => (
        <span className="text-sm text-zinc-text font-bold">
          {category.order ?? 0}
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
      label: t('common.delete') || 'حذف',
      icon: Trash2,
      onClick: (category: Category) => {
        if (typeof window !== 'undefined' && window.confirm(`${t('category.delete_confirm') || 'هل أنت متأكد من حذف هذه الفئة؟'}\n\n"${category.name}"`)) {
          handleDelete(category.id, category.name);
        }
      },
    },
  ];

  if (!isClient) return null;

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-start justify-between gap-6",
        dir === 'rtl' ? 'text-right' : 'text-left'
      )}>
        <div className={cn("space-y-1", dir === 'rtl' ? 'text-right' : 'text-left')}>
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('category.total') || 'Total Categories'}
          value={stats?.total ?? 0}
          icon={LayoutGrid}
          className="bg-warning/10 text-warning shadow-[0_0_20px_rgba(245,158,11,0.05)]"
          iconClassName="text-warning"
          isLoading={statsLoading}
        />
        <StatCard
          label={t('category.active') || 'Active'}
          value={stats?.active ?? 0}
          icon={Activity}
          className="bg-success/10 text-success shadow-[0_0_20px_rgba(16,185,129,0.05)]"
          iconClassName="text-success"
          isLoading={statsLoading}
        />
        <StatCard
          label={t('category.inactive') || 'Inactive'}
          value={stats?.inactive ?? 0}
          icon={Ban}
          className="bg-danger/10 text-danger shadow-[0_0_20px_rgba(239,68,68,0.05)]"
          iconClassName="text-danger"
          isLoading={statsLoading}
        />
        <StatCard
          label={t('category.main') || 'Main Categories'}
          value={stats?.withParent ?? 0}
          icon={Layers}
          className="bg-info/10 text-info shadow-[0_0_20px_rgba(59,130,246,0.05)]"
          iconClassName="text-info"
          isLoading={statsLoading}
        />
      </div>

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
            dir === 'rtl' ? 'left-3' : 'right-3'
          )} />
          <AmberInput
            placeholder={t('category.search_placeholder') || 'البحث عن فئة...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "bg-[var(--color-obsidian-card)] border-[var(--color-border)] shadow-sm rounded-xl h-11 focus:ring-[var(--color-brand)]/20",
              dir === 'rtl' ? 'pl-10 pr-4 text-right' : 'pr-10 pl-4 text-left'
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
            data={data?.categories || []}
            keyField="id"
            sortable
            selectable
            rowActions={rowActions}
            pagination
            pageSize={10}
          />
        )}
      </div>

    </div>
  );
}

export default CategoriesPage;
