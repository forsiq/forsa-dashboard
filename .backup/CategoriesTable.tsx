import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Folder, MoreVertical, Shirt, Laptop, Book, Smartphone, Activity, Monitor } from 'lucide-react';
import { useLanguage } from '../../../core/contexts/LanguageContext';
import { cn } from '../../../core/lib/utils/cn';
import { DataTable, type Column } from '../../../core/components/Data/DataTable';
import { AmberButton } from '../../../core/components/AmberButton';
import { StatusBadge } from '../../../core/components/Data/StatusBadge';
import type { Category } from '../types';

// --- Types ---

interface CategoriesTableProps {
  data: Category[];
  isLoading?: boolean;
  onEdit?: (category: Category) => void;
  onDelete?: (id: string, name: string) => void;
}

// --- Helper Components ---

/**
 * Get category icon based on name or slug
 */
function getCategoryIcon(category: Category) {
  const name = (category.name || '').toLowerCase();
  const slug = (category.slug || '').toLowerCase();
  
  if (name.includes('cloth') || slug.includes('cloth')) return Shirt;
  if (name.includes('laptop') || slug.includes('laptop')) return Laptop;
  if (name.includes('book') || slug.includes('book')) return Book;
  if (name.includes('phone') || slug.includes('phone')) return Smartphone;
  if (name.includes('sport') || slug.includes('sport')) return Activity;
  if (name.includes('elect') || slug.includes('elect')) return Monitor;
  
  return Folder;
}

/**
 * CategoryName - Displays category name with specific icon
 */
function CategoryName({ category }: { category: Category }) {
  const Icon = getCategoryIcon(category);
  const { dir } = useLanguage();
  
  return (
    <div className={cn("flex items-center gap-3", dir === 'rtl' ? 'flex-row' : 'flex-row-reverse justify-end')}>
      <span className="text-sm font-bold text-zinc-text">
        {category.name}
      </span>
      <div className="p-1.5 rounded-lg bg-black/5">
        <Icon className="w-4 h-4 text-zinc-muted" />
      </div>
    </div>
  );
}

// --- Main Table Component ---

/**
 * CategoriesTable - Table component for displaying categories
 */
export function CategoriesTable({
  data,
  isLoading = false,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const { t, dir } = useLanguage();

  const columns: Column<Category>[] = [
    {
      key: 'name',
      label: t('category.name') || 'Name',
      render: (category) => <CategoryName category={category} />,
      sortable: true,
      align: 'left',
    },
    {
      key: 'slug',
      label: t('category.slug') || 'Slug',
      render: (category) => (
        <div className="flex items-center gap-2">
           <span className="text-sm text-zinc-text font-medium uppercase tracking-tight">
            {category.slug || '-'}
          </span>
          {category.image && (
            <img src={category.image} alt="" className="w-8 h-8 rounded object-cover border border-[var(--color-border)]" />
          )}
        </div>
      ),
      align: 'left',
    },
    {
      key: 'productCount',
      label: t('category.products_count') || 'Products',
      render: (category) => (
        <span className="text-sm text-zinc-text font-bold">
          {category.productCount || 0}
        </span>
      ),
      align: 'center',
    },
    {
      key: 'status',
      label: t('category.status') || 'Status',
      render: (category) => (
        <StatusBadge
          status={category.status === 'active' ? (t('category.active') || 'Active') : (t('category.inactive') || 'Inactive')}
          variant={category.status === 'active' ? 'success' : 'inactive'}
          size="sm"
        />
      ),
      align: 'center',
    },
    {
      key: 'order',
      label: t('category.order') || 'Order',
      render: (category) => (
        <span className="text-sm text-zinc-text font-bold">
          {category.order ?? 0}
        </span>
      ),
      align: 'center',
    },
  ];


  // Row actions
  const rowActions = [
    {
      label: t('common.edit') || 'تعديل',
      icon: Edit,
      onClick: (category: Category) => onEdit?.(category),
    },
    {
      label: t('common.delete') || 'حذف',
      icon: Trash2,
      variant: 'danger' as const,
      onClick: (category: Category) => {
        if (window.confirm(`${t('category.delete_confirm') || 'هل أنت متأكد من حذف هذه الفئة؟'}\n\n"${category.name}"`)) {
          onDelete?.(category.id, category.name);
        }
      },
    },
  ];

  // Empty state
  const emptyMessage = t('category.empty') || 'No categories found';

  // Expanded row content (sub-categories)
  const expandComponent = (category: Category) => (
    <div className={cn(
      'p-4 space-y-3',
      dir === 'rtl' ? 'text-right' : 'text-left'
    )}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Description */}
        {category.description && (
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-zinc-muted uppercase tracking-wider">
              {t('category.description') || 'Description'}
            </p>
            <p className="text-sm text-zinc-text leading-relaxed">{category.description}</p>
          </div>
        )}

        {/* Arabic Name */}
        {category.nameAr && (
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-zinc-muted uppercase tracking-wider">
              {t('category.name_ar') || 'Arabic Name'}
            </p>
            <p className="text-base text-zinc-text" dir="rtl">
              {category.nameAr}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-zinc-muted uppercase tracking-wider">
            {t('common.details') || 'Details'}
          </p>
          <div className="text-sm space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-muted">
              <span className="font-mono">{category.id.slice(0, 8)}...</span>
            </div>
            <div className="text-zinc-muted">
              {new Date(category.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
        <Link
          to={`/categories/${category.id}`}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wide border border-black/10 rounded-lg text-zinc-text hover:bg-black/5 hover:text-black transition-colors"
        >
          {t('common.view_details') || 'View Details'}
        </Link>
        {onEdit && (
          <AmberButton
            size="sm"
            variant="outline"
            onClick={() => onEdit(category)}
          >
            {t('common.edit') || 'Edit'}
          </AmberButton>
        )}
      </div>
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      keyField="id"
      sortable
      selectable
      expandable
      expandComponent={expandComponent}
      rowActions={rowActions}
      loading={isLoading}
      emptyMessage={emptyMessage}
      pagination
      pageSize={10}
    />
  );
}

// --- Compact Table Variant (for inline use) ---

interface CompactCategoriesTableProps {
  data: Category[];
  isLoading?: boolean;
  onEdit?: (category: Category) => void;
  onDelete?: (id: string) => void;
}

/**
 * CompactCategoriesTable - Smaller version for use in modals or sidebars
 */
export function CompactCategoriesTable({
  data,
  isLoading,
  onEdit,
  onDelete,
}: CompactCategoriesTableProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-zinc-card/50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-muted">
        {t('category.no_results') || 'No categories found'}
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--color-border)]">
      {data.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between py-3 hover:bg-[var(--color-obsidian-hover)] transition-colors px-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <Folder className="w-4 h-4 text-zinc-muted/50" />
            <div>
              <p className="text-sm font-medium text-zinc-text">{category.name}</p>
              {category.productCount !== undefined && (
                <p className="text-xs text-zinc-secondary font-medium">
                  {category.productCount} {t('category.products') || 'products'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(category)}
                className="p-2 text-zinc-muted hover:text-brand hover:bg-[var(--color-obsidian-hover)] rounded transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(category.id)}
                className="p-2 text-zinc-muted hover:text-danger hover:bg-[var(--color-obsidian-hover)] rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CategoriesTable;
