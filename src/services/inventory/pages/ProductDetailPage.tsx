import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Package,
  DollarSign,
  Tag,
  Layers,
  Barcode,
  Hash,
  Weight,
  Percent,
  Calendar,
  FileText,
  AlertCircle,
  Trash2,
  Edit3,
  ImageOff,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { useById, useDelete } from '../hooks';
import { useConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { AmberImageGallery } from '@core/components/AmberImageGallery';
import { useAttachmentUrls } from '@core/hooks/useAttachmentUrls';
import { DetailPageSkeleton } from '@core/loading';
import { useRouteParam } from '@core/hooks/useRouteParam';
import type { Product } from '../types';

const stockStatusVariant: Record<string, 'success' | 'warning' | 'failed' | 'inactive'> = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'failed',
  discontinued: 'inactive',
};

const stockStatusLabelKey: Record<string, string> = {
  in_stock: 'inventory.stock_status.in_stock',
  low_stock: 'inventory.stock_status.low_stock',
  out_of_stock: 'inventory.stock_status.out_of_stock',
  discontinued: 'inventory.stock_status.discontinued',
};

const productTypeLabel: Record<string, string> = {
  simple: 'Simple',
  variable: 'Variable',
  bundle: 'Bundle',
};

export const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';

  const [productId, paramReady] = useRouteParam('id', { parse: 'number', safe: true });
  const enabled = paramReady && !!productId;

  const { data: product, isPending: productLoading } = useById(String(productId), enabled);
  const deleteProduct = useDelete();
  const { openConfirm, ConfirmModal } = useConfirmModal();

  // Resolve images: direct URLs first, then attachment IDs
  const directImageUrls = product?.images?.filter((url: string) => url && typeof url === 'string') || [];
  const attachmentIds = product?.attachmentIds || [];
  const { data: attachmentUrlMap } = useAttachmentUrls(
    directImageUrls.length === 0 ? attachmentIds : [],
  );

  const allImages = (() => {
    if (directImageUrls.length > 0) return directImageUrls;
    if (!attachmentUrlMap || attachmentIds.length === 0) return [];
    return attachmentIds
      .map((id: number) => attachmentUrlMap.get(id))
      .filter((url: string | null | undefined): url is string => url != null);
  })();

  // Detail rows for the right panel
  const detailRows = useMemo(() => {
    if (!product) return [];
    const rows = [
      { icon: DollarSign, label: t('inventory.detail.selling_price') || 'Selling Price', value: formatCurrency(product.sellingPrice) },
      { icon: DollarSign, label: t('inventory.detail.cost_price') || 'Cost Price', value: formatCurrency(product.costPrice) },
      { icon: Percent, label: t('inventory.detail.tax_rate') || 'Tax Rate', value: `${product.taxRate}%` },
      { icon: Layers, label: t('inventory.detail.type') || 'Type', value: productTypeLabel[product.type] || product.type },
      { icon: Package, label: t('inventory.detail.stock') || 'Stock', value: `${product.stockQuantity} ${product.unit}` },
      { icon: Tag, label: t('inventory.detail.category') || 'Category', value: product.category?.name || '—' },
      { icon: Hash, label: t('inventory.detail.brand') || 'Brand', value: product.brand?.name || '—' },
      { icon: Barcode, label: t('inventory.detail.sku') || 'SKU', value: product.sku },
      { icon: Weight, label: t('inventory.detail.unit') || 'Unit', value: product.unit },
    ];

    if (product.barcode) {
      rows.push({ icon: Barcode, label: t('inventory.detail.barcode') || 'Barcode', value: product.barcode });
    }

    if (product.createdAt) {
      rows.push({ icon: Calendar, label: t('inventory.detail.created_at') || 'Created At', value: new Date(product.createdAt).toLocaleString() });
    }

    if (product.updatedAt) {
      rows.push({ icon: Calendar, label: t('inventory.detail.updated_at') || 'Updated At', value: new Date(product.updatedAt).toLocaleString() });
    }

    return rows;
  }, [product, t]);

  // Specifications from attributes
  const specs = useMemo(() => {
    if (!product?.attributes || Object.keys(product.attributes).length === 0) return [];
    return Object.entries(product.attributes).map(([key, value]) => ({
      label: key,
      value: String(value),
    }));
  }, [product]);

  const handleDelete = () => {
    if (!product) return;
    openConfirm({
      title: t('inventory.detail.delete_title') || 'Delete Product',
      message: t('inventory.detail.delete_confirm') || 'Are you sure you want to delete this product? This action cannot be undone.',
      onConfirm: () => {
        deleteProduct.mutate(String(product.id), {
          onSuccess: () => {
            router.push('/inventory');
          },
        });
      },
      variant: 'danger',
    });
  };

  // Loading state
  if (!paramReady || !productId || productLoading) {
    return <DetailPageSkeleton />;
  }

  // Not found state
  if (!product) {
    return (
      <Card className="max-w-2xl mx-auto !p-12 text-center space-y-6 bg-obsidian-card border-danger/20">
        <AlertCircle className="w-16 h-16 text-danger mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-zinc-text tracking-tighter">{t('inventory.detail.not_found') || 'Product Not Found'}</h2>
          <p className="text-zinc-muted font-semibold tracking-tight text-sm">{t('inventory.detail.not_found_text') || 'The product you are looking for does not exist or has been removed.'}</p>
        </div>
        <Link href="/inventory">
          <AmberButton variant="secondary" className="px-8 h-12 uppercase font-bold">
            {t('common.back') || 'Back'}
          </AmberButton>
        </Link>
      </Card>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6 animate-in fade-in duration-700" dir={dir}>
      {/* Header */}
      <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 w-full flex-1 items-center gap-4">
          <Link href="/inventory">
            <button
              type="button"
              className="h-10 w-10 shrink-0 rounded-lg bg-obsidian-card border border-white/5 flex items-center justify-center text-zinc-muted hover:text-brand hover:border-brand/30 transition-all active:scale-95"
            >
              <ArrowLeft className={cn('w-4 h-4', isRTL && 'rotate-180')} />
            </button>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <StatusBadge
                status={product.stockStatus}
                labelKey={stockStatusLabelKey[product.stockStatus]}
                variant={stockStatusVariant[product.stockStatus] || 'inactive'}
                size="sm"
              />
              {product.isActive && (
                <StatusBadge
                  status="active"
                  labelKey="inventory.status.active"
                  variant="success"
                  size="sm"
                />
              )}
              <span className="text-[11px] font-semibold text-zinc-muted tracking-widest">#{product.id}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-zinc-text tracking-tight leading-tight mt-1 min-w-0 break-words lg:truncate">
              {product.name}
            </h1>
          </div>
        </div>
        <div
          className={cn(
            'flex w-full min-w-0 flex-wrap items-center gap-2',
            isRTL ? 'justify-end' : 'justify-start',
            'lg:ms-auto lg:w-auto lg:shrink-0 lg:flex-nowrap',
          )}
        >
          <AmberButton
            className="h-10 bg-obsidian-card border border-white/10 text-danger font-bold uppercase tracking-wider rounded-lg px-6 hover:border-danger/30 active:scale-95 transition-all text-xs gap-1.5"
            onClick={handleDelete}
            disabled={deleteProduct.isPending}
          >
            {deleteProduct.isPending ? (
              <div className="w-3.5 h-3.5 border-2 border-danger border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            {t('common.delete') || 'Delete'}
          </AmberButton>
          <Link href={`/inventory/edit/${product.id}`}>
            <AmberButton
              className="h-10 bg-brand text-black font-bold uppercase tracking-wider rounded-lg px-6 hover:bg-brand/90 active:scale-95 transition-all border-none text-xs gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {t('common.edit') || 'Edit'}
            </AmberButton>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image + Description + Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          {allImages.length > 0 ? (
            <AmberImageGallery
              images={allImages}
              alt={product.name}
              height="h-[300px] lg:h-[460px]"
              overlay={
                <>
                  <div className="absolute top-4 start-4 flex items-center gap-2">
                    <div className="bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-brand" />
                      <span className="text-xs font-semibold text-white tracking-wider">
                        {productTypeLabel[product.type] || product.type}
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <span className="text-[11px] font-semibold text-brand tracking-widest">
                      {product.category?.name || t('inventory.detail.uncategorized') || 'Uncategorized'}
                    </span>
                    <h2 className="text-lg font-bold text-white leading-snug line-clamp-2 mt-1">{product.name}</h2>
                  </div>
                </>
              }
            />
          ) : (
            <div className="h-[300px] lg:h-[460px] bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-brand/5" />
              <div className="flex flex-col items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-obsidian-outer border border-white/10 flex items-center justify-center">
                  <ImageOff className="w-8 h-8 text-zinc-muted/40" />
                </div>
                <p className="text-sm font-semibold text-zinc-muted tracking-wider uppercase">
                  {t('inventory.detail.no_images') || 'No images available'}
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-text uppercase tracking-widest">{t('inventory.detail.description') || 'Description'}</h3>
              </div>
              <p className="text-sm text-zinc-text font-medium leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {/* Specifications */}
          {specs.length > 0 && (
            <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-text uppercase tracking-widest">{t('inventory.detail.specifications') || 'Specifications'}</h3>
              </div>
              <div className="space-y-0">
                {specs.map((spec, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center justify-between py-3 gap-4',
                      i < specs.length - 1 && 'border-b border-white/5',
                    )}
                  >
                    <span className="text-[13px] font-semibold text-zinc-muted tracking-wide">{spec.label}</span>
                    <span className="text-sm font-bold text-zinc-text text-end">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Price + Stock + Info */}
        <div className="space-y-6">
          {/* Price Panel */}
          <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-6 space-y-5 relative overflow-hidden">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-zinc-muted tracking-widest">{t('inventory.detail.selling_price') || 'Selling Price'}</span>
              <p className="text-2xl sm:text-3xl font-bold text-brand tabular-nums leading-none tracking-tight">
                {formatCurrency(product.sellingPrice)}
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-zinc-muted tracking-widest">{t('inventory.detail.cost_price') || 'Cost Price'}</span>
                <p className="text-lg font-bold text-zinc-text tabular-nums leading-none">{formatCurrency(product.costPrice)}</p>
              </div>
              <div className="space-y-1 text-end">
                <span className="text-[11px] font-semibold text-zinc-muted tracking-widest">{t('inventory.detail.margin') || 'Margin'}</span>
                <p className="text-lg font-bold text-emerald-400 tabular-nums leading-none">
                  {product.sellingPrice > 0
                    ? `${(((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100).toFixed(1)}%`
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Stock Info */}
          <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
              <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                <Package className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-text uppercase tracking-widest">{t('inventory.detail.stock_info') || 'Stock Info'}</h3>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 shrink-0">
                  <Package className="w-4 h-4 text-zinc-muted" />
                  <span className="text-[13px] font-semibold text-zinc-muted tracking-wide">{t('inventory.detail.quantity') || 'Quantity'}</span>
                </div>
                <span className="text-sm font-bold text-zinc-text text-end">{product.stockQuantity} {product.unit}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 shrink-0">
                  <AlertCircle className="w-4 h-4 text-zinc-muted" />
                  <span className="text-[13px] font-semibold text-zinc-muted tracking-wide">{t('inventory.detail.low_stock_threshold') || 'Low Stock Threshold'}</span>
                </div>
                <span className="text-sm font-bold text-zinc-text text-end">{product.lowStockThreshold} {product.unit}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 shrink-0">
                  <Tag className="w-4 h-4 text-zinc-muted" />
                  <span className="text-[13px] font-semibold text-zinc-muted tracking-wide">{t('inventory.detail.stock_status') || 'Status'}</span>
                </div>
                <StatusBadge
                  status={product.stockStatus}
                  labelKey={stockStatusLabelKey[product.stockStatus]}
                  variant={stockStatusVariant[product.stockStatus] || 'inactive'}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-[var(--color-obsidian-card)] border border-white/5 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
              <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                <Hash className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-text uppercase tracking-widest">{t('inventory.detail.details') || 'Details'}</h3>
            </div>

            <div className="space-y-3.5">
              {detailRows.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-3 group/row">
                  <div className="flex items-center gap-2.5 shrink-0">
                    <item.icon className="w-4 h-4 text-zinc-muted group-hover/row:text-brand transition-colors" />
                    <span className="text-[13px] font-semibold text-zinc-muted tracking-wide">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-zinc-text text-end break-words">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal />
    </div>
  );
};

export default ProductDetailPage;
