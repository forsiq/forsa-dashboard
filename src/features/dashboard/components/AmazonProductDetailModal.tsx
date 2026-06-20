import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Image from 'next/image';
import {
  X,
  Star,
  Check,
  Download,
  Loader2,
  ExternalLink,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';
import { useAmazonProduct } from '@services/amazon/hooks/useAmazonSearch';
import { useCreateListing, listingKeys } from '@features/listings/api/listing-hooks';
import { collectAmazonProductImages } from '@services/amazon/utils/amazon-images';
import {
  collectAmazonListingSpecs,
  normalizeAmazonSpecs,
} from '@services/amazon/utils/amazon-specs';
import type { ListingSpec } from '../../../types/services/listings.types';
import { useRouter } from 'next/router';
import { useDashboardRole } from '@core/hooks/useDashboardRole';
import { categoryKeys } from '@services/categories/api/categories';
import { resolveImportCategory } from '@services/amazon/utils/resolve-import-category';
import {
  AmazonImportCategoryPanel,
  createInitialCategoryState,
  type AmazonImportCategoryState,
} from './AmazonImportCategoryPanel';

interface AmazonProductDetailModalProps {
  asin: string | null;
  isOpen: boolean;
  onClose: () => void;
}

type ImportPhase = 'idle' | 'creating' | 'redirecting';

export function AmazonProductDetailModal({
  asin,
  isOpen,
  onClose,
}: AmazonProductDetailModalProps) {
  const { t, dir, language } = useLanguage();
  const isRTL = dir === 'rtl';
  const router = useRouter();
  const queryClient = useQueryClient();
  const createMutation = useCreateListing();
  const { canManageCategories } = useDashboardRole();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [importPhase, setImportPhase] = useState<ImportPhase>('idle');
  const [importImageCount, setImportImageCount] = useState(0);
  const [categoryState, setCategoryState] = useState<AmazonImportCategoryState>(
    createInitialCategoryState,
  );

  const isImporting = importPhase !== 'idle';

  const { data, isLoading, error } = useAmazonProduct(asin || '', {
    enabled: isOpen && !!asin,
  });

  const product = data?.product;

  useEffect(() => {
    if (!isOpen && importPhase === 'idle') {
      setImportImageCount(0);
      setCurrentImageIndex(0);
      setCategoryState(createInitialCategoryState());
    }
  }, [isOpen, importPhase]);

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [isOpen]);

  const handleCategoryChange = useCallback((next: AmazonImportCategoryState) => {
    setCategoryState(next);
  }, []);

  const keepPortalMounted = isOpen || importPhase !== 'idle';
  if (!keepPortalMounted || typeof window === 'undefined') return null;

  const formatPrice = () => {
    if (!product?.price) return null;
    return product.price.display || (product.price.value ? `${product.price.value}` : null);
  };

  const handleImport = async () => {
    if (!product || !categoryState.parentId) return;

    const imageUrls = collectAmazonProductImages(product);
    setImportImageCount(imageUrls.length);
    setImportPhase('creating');

    try {
      const categoryResult = await resolveImportCategory({
        product,
        parentId: categoryState.parentId,
        mode: categoryState.mode,
        subName: categoryState.subName,
        existingSubId: categoryState.existingSubId,
        canCreateCategory: canManageCategories,
        language,
      });

      if (categoryResult.createdSubcategory) {
        await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      }

      // Convert Amazon specifications to ListingSpec[] format
      const specs: ListingSpec[] = collectAmazonListingSpecs(product);

      const payload: any = {
        title: String(product.title ?? '').trim() || 'Untitled',
        description: product.description || product.feature_bullets?.join('\n') || '',
        categoryId: categoryResult.categoryId,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        brand: product.brand || '',
        sku: product.asin,
        specs: specs.length > 0 ? specs : undefined,
        metadata: {
          source: 'amazon',
          asin: product.asin,
          originalImageUrls: imageUrls,
          imagesCount: imageUrls.length,
          importCategory: {
            parentId: categoryState.parentId,
            categoryId: categoryResult.categoryId,
            createdSub: !!categoryResult.createdSubcategory,
            matchedExisting: !!categoryResult.matchedExisting,
          },
        },
      };

      const result = await createMutation.mutateAsync(payload);
      const listing = (result as any)?.data ?? result;
      const listingId = listing?.id;

      if (listingId && listing) {
        queryClient.setQueryData(listingKeys.detail(listingId), listing);
      }

      setImportPhase('redirecting');

      // Keep the portal mounted until navigation completes — closing the modal
      // before router.push races React portal cleanup with the page transition.
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      if (listingId) {
        await router.push({
          pathname: `/listings/${listingId}/edit`,
          query: { imported: '1', step: '1' },
        });
      } else {
        await router.push('/listings');
      }
    } catch {
      // Error handled by mutation
      setImportPhase('idle');
    }
  };

  const importStatusMessage =
    importPhase === 'redirecting'
      ? t('amazon.import_redirecting')
      : importImageCount > 0
        ? t('amazon.importing_images', { count: importImageCount })
        : t('amazon.importing');

  const allImages = product ? collectAmazonProductImages(product) : [];

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isImporting ? undefined : onClose}
      />

      {/* Modal */}
      <div className={cn(
        'relative w-full max-w-4xl max-h-[90vh] overflow-y-auto',
        'bg-obsidian-card border border-white/5 rounded-2xl shadow-2xl',
        'animate-in zoom-in-95 duration-200'
      )}>
        {isImporting && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-obsidian-card/95 backdrop-blur-sm rounded-2xl">
            <Loader2 className="w-12 h-12 animate-spin text-brand" />
            <div className="text-center space-y-2 px-6 max-w-md">
              <p className="text-base font-black text-zinc-text uppercase tracking-tight">
                {t('amazon.importing_title')}
              </p>
              <p className="text-sm font-bold text-zinc-muted">
                {importStatusMessage}
              </p>
              {importImageCount > 0 && importPhase === 'creating' && (
                <p className="text-xs text-zinc-muted/70">
                  {t('amazon.importing_hint')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isImporting}
          className={cn(
            'absolute top-4 z-10 w-10 h-10 rounded-xl',
            'bg-obsidian-outer border border-white/5 flex items-center justify-center',
            'text-zinc-muted hover:text-zinc-text hover:border-white/10 transition-all',
            'disabled:opacity-40 disabled:pointer-events-none',
            isRTL ? 'left-4' : 'right-4'
          )}
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-brand" />
            <p className="text-sm font-bold text-zinc-muted">
              {t('amazon.loading_details') || 'Loading product details...'}
            </p>
          </div>
        ) : error || !product ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Package className="w-12 h-12 text-zinc-muted/30" />
            <p className="text-sm font-bold text-zinc-muted">
              {t('amazon.error_details') || 'Failed to load product details'}
            </p>
          </div>
        ) : (
          <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-0', isRTL && 'direction-rtl')}>
            {/* Image Gallery */}
            <div className="p-6 space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-obsidian-outer">
                {allImages.length > 0 ? (
                  <>
                    <Image
                      src={allImages[currentImageIndex]}
                      alt={product.title || 'Product'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 600px"
                    />
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                          className={cn(
                            'absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg',
                            'bg-black/50 backdrop-blur-sm flex items-center justify-center',
                            'text-white hover:bg-black/70 transition-all',
                            isRTL ? 'right-2' : 'left-2'
                          )}
                        >
                          {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(Math.min(allImages.length - 1, currentImageIndex + 1))}
                          className={cn(
                            'absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg',
                            'bg-black/50 backdrop-blur-sm flex items-center justify-center',
                            'text-white hover:bg-black/70 transition-all',
                            isRTL ? 'left-2' : 'right-2'
                          )}
                        >
                          {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-zinc-muted/20" />
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        'relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                        index === currentImageIndex
                          ? 'border-brand'
                          : 'border-white/5 hover:border-white/10'
                      )}
                    >
                      <Image src={img} alt={`Thumbnail ${index + 1}`} fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6 space-y-6 border-t lg:border-t-0 lg:border-border">
              <div className="space-y-4">
                <h2 className="text-lg font-black text-zinc-text leading-snug">
                  {product.title || 'Untitled'}
                </h2>

                {/* Price */}
                {formatPrice() && (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-brand">{formatPrice()}</span>
                    {product.price?.savings_percent && (
                      <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-black">
                        -{product.price.savings_percent}%
                      </span>
                    )}
                  </div>
                )}

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-zinc-text">{product.rating}</span>
                    {product.ratings_total && (
                      <span className="text-xs text-zinc-muted">
                        ({product.ratings_total.toLocaleString()} {t('amazon.reviews') || 'reviews'})
                      </span>
                    )}
                  </div>
                )}

                {/* Prime */}
                {product.is_prime && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 w-fit">
                    <Check className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-black text-blue-400 uppercase tracking-wider">Prime</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-2">
                  <h3 className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                    {t('amazon.description') || 'Description'}
                  </h3>
                  <p className="text-[13px] text-zinc-text/80 leading-relaxed line-clamp-4">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Features */}
              {product.feature_bullets && product.feature_bullets.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                    {t('amazon.features') || 'Features'}
                  </h3>
                  <ul className="space-y-1.5">
                    {product.feature_bullets.slice(0, 5).map((feature, index) => (
                      <li key={index} className="text-[13px] text-zinc-text/70 flex gap-2">
                        <span className="text-brand mt-0.5 shrink-0">&#8226;</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specifications */}
              {(() => {
                const specRows = normalizeAmazonSpecs(product.specifications).slice(0, 6);
                if (specRows.length === 0) return null;
                return (
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                      {t('amazon.specifications') || 'Specifications'}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {specRows.map((spec, idx) => (
                        <div key={`${spec.label}-${idx}`} className="px-3 py-2 rounded-lg bg-obsidian-outer border border-white/5">
                          <p className="text-[11px] text-zinc-muted uppercase tracking-wider">{spec.label}</p>
                          <p className="text-[13px] font-bold text-zinc-text mt-0.5">{spec.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <AmazonImportCategoryPanel
                product={product}
                value={categoryState}
                onChange={handleCategoryChange}
                disabled={isImporting}
              />

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <AmberButton
                  className="flex-1 h-12 bg-brand text-black font-black rounded-xl gap-2 border-none active:scale-95 transition-all"
                  onClick={handleImport}
                  disabled={isImporting || !categoryState.parentId || !categoryState.isReady}
                >
                  {isImporting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  {isImporting
                    ? t('amazon.importing')
                    : t('amazon.import_as_listing') || 'Import as Listing'}
                </AmberButton>

                {product.link && (
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'h-12 px-4 rounded-xl flex items-center gap-2',
                      'border border-white/10 text-zinc-muted hover:text-zinc-text hover:border-white/20',
                      'transition-all text-xs font-bold',
                      isImporting && 'pointer-events-none opacity-40',
                    )}
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t('amazon.view_on_amazon') || 'Amazon'}
                  </a>
                )}
              </div>

              {/* ASIN */}
              <p className="text-[11px] font-mono text-zinc-muted/40 tracking-wider text-center">
                ASIN: {product.asin}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
