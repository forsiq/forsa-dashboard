import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  LayoutGrid,
  AlertCircle,
  Calendar,
  Hash,
  Activity,
  ToggleLeft,
  SortAsc,
  FileText,
  Globe,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useGetCategory, useDeleteCategoryMutation } from '../hooks';
import type { Category } from '../types';

/**
 * CategoryDetailPage - Category details view
 */
export function CategoryDetailPage() {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const { id } = router.query;
  const [isClient, setIsClient] = useState(false);
  const { openConfirm, ConfirmModal } = useConfirmModal();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    data: category,
    isLoading,
    error,
  } = useGetCategory((id as string) || '', true);

  const deleteMutation = useDeleteCategoryMutation({
    onSuccess: () => {
      router.push('/categories');
    },
  });

  const handleDelete = () => {
    openConfirm({
      title: t('category.delete') || 'حذف الفئة',
      message: t('category.delete_confirm') || 'هل أنت متأكد من حذف هذه الفئة؟',
      variant: 'destructive',
      onConfirm: () => {
        deleteMutation.mutate((id as string)!);
      },
    });
  };

  if (!isClient) return null;

  if (isLoading || !router.isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-danger mx-auto" />
        <h2 className="text-lg font-bold text-zinc-text">
          {t('category.not_found') || 'Category not found'}
        </h2>
        <p className="text-sm text-zinc-muted">
          {t('category.not_found_desc') || 'The category you are looking for does not exist.'}
        </p>
        <AmberButton onClick={() => router.push('/categories')}>
          {t('common.back') || 'Back to Categories'}
        </AmberButton>
      </div>
    );
  }

  const isRTL = dir === 'rtl';

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8" dir={dir}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={() => router.push('/categories')}
            className="w-12 h-12 rounded-xl bg-obsidian-card border border-border flex items-center justify-center text-zinc-muted hover:text-brand hover:border-brand transition-all active:scale-95 shadow-lg"
          >
            <ArrowLeft className={cn('w-5 h-5', isRTL && 'rotate-180')} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-brand uppercase tracking-widest">
                {t('category.title') || 'Category'}
              </span>
              <div className="w-1 h-1 rounded-full bg-zinc-muted/30" />
              <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
                ID: {category.id}
              </span>
            </div>
            <h1 className="text-4xl font-black text-zinc-text tracking-tighter uppercase leading-none mt-1">
              {category.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <AmberButton
            variant="secondary"
            className="p-0 w-12 h-12 rounded-xl bg-obsidian-card border-border flex items-center justify-center hover:text-danger active:scale-95 transition-all"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-5 h-5 text-zinc-muted" />
          </AmberButton>
          <Link href={`/categories/${category.id}/edit`}>
            <AmberButton className="h-12 bg-white text-black font-black uppercase tracking-widest rounded-xl px-8 hover:bg-zinc-200 active:scale-95 transition-all">
              <Edit className="w-4 h-4 mr-2" />
              {t('common.edit') || 'Edit'}
            </AmberButton>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Category Info Card */}
          <AmberCard className="!p-8 bg-obsidian-card border-border shadow-xl space-y-8">
            <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning border border-warning/20">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">
                {t('category.details') || 'Category Details'}
              </h3>
              <div className="ml-auto">
                <StatusBadge
                  status={
                    category.isActive
                      ? t('category.active') || 'Active'
                      : t('category.inactive') || 'Inactive'
                  }
                  variant={category.isActive ? 'success' : 'inactive'}
                  className="font-black tracking-[0.15em]"
                />
              </div>
            </div>

            <div className="space-y-5">
              {/* Name */}
              <DetailRow
                icon={<LayoutGrid className="w-4 h-4" />}
                label={t('category.name') || 'Name'}
                value={category.name}
                isRTL={isRTL}
              />

              {/* Arabic Name */}
              {category.nameAr && (
                <DetailRow
                  icon={<Globe className="w-4 h-4" />}
                  label={t('category.name_ar') || 'Arabic Name'}
                  value={category.nameAr}
                  isRTL={isRTL}
                />
              )}

              {/* Slug */}
              {category.slug && (
                <DetailRow
                  icon={<Hash className="w-4 h-4" />}
                  label={t('category.slug') || 'Slug'}
                  value={category.slug}
                  isRTL={isRTL}
                  mono
                />
              )}

              {/* Description */}
              {category.description && (
                <div className="flex items-start justify-between group">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-zinc-muted group-hover:text-brand transition-colors mt-0.5" />
                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
                      {t('category.description') || 'Description'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-zinc-text tracking-tight max-w-[60%] text-right">
                    {category.description}
                  </span>
                </div>
              )}

              {/* Sort Order */}
              <DetailRow
                icon={<SortAsc className="w-4 h-4" />}
                label={t('category.order') || 'Sort Order'}
                value={String(category.sortOrder ?? 0)}
                isRTL={isRTL}
              />

              {/* Product Count */}
              <DetailRow
                icon={<Activity className="w-4 h-4" />}
                label={t('category.products_count') || 'Products Count'}
                value={String(category.productCount ?? 0)}
                isRTL={isRTL}
              />
            </div>
          </AmberCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Status Card */}
          <AmberCard className="!p-8 bg-obsidian-card border-border shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em]">
                {t('category.status_info') || 'Status Info'}
              </h3>
            </div>

            <div className="space-y-5">
              {/* Active Status */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <ToggleLeft className="w-4 h-4 text-zinc-muted group-hover:text-brand transition-colors" />
                  <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
                    {t('category.active') || 'Active'}
                  </span>
                </div>
                <StatusBadge
                  status={category.isActive ? 'Yes' : 'No'}
                  variant={category.isActive ? 'success' : 'inactive'}
                  size="sm"
                />
              </div>

              {/* Created At */}
              <DetailRow
                icon={<Calendar className="w-4 h-4" />}
                label={t('category.created_at') || 'Created At'}
                value={new Date(category.createdAt).toLocaleString()}
                isRTL={isRTL}
              />

              {/* Updated At */}
              {category.updatedAt && (
                <DetailRow
                  icon={<Calendar className="w-4 h-4" />}
                  label={t('category.updated_at') || 'Updated At'}
                  value={new Date(category.updatedAt).toLocaleString()}
                  isRTL={isRTL}
                />
              )}
            </div>

            <div className="pt-4">
              <Link href={`/categories/${category.id}/edit`}>
                <AmberButton
                  variant="secondary"
                  className="w-full gap-2 font-black uppercase tracking-widest text-[10px] h-10 bg-obsidian-panel border-border active:scale-95 transition-all"
                >
                  <Edit className="w-4 h-4" />
                  {t('common.edit') || 'Edit Category'}
                </AmberButton>
              </Link>
            </div>
          </AmberCard>
        </div>
      </div>

      <ConfirmModal />
    </div>
  );
}

// Helper component for detail rows
function DetailRow({
  icon,
  label,
  value,
  isRTL,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isRTL: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <span className="text-zinc-muted group-hover:text-brand transition-colors">
          {icon}
        </span>
        <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
          {label}
        </span>
      </div>
      <span
        className={cn(
          'text-xs font-bold text-zinc-text tracking-tight',
          mono && 'font-mono'
        )}
      >
        {value}
      </span>
    </div>
  );
}

export default CategoryDetailPage;
