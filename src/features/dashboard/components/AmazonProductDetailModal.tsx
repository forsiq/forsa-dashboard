import React, { useState } from 'react';
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
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';
import { useAmazonProduct } from '@services/amazon/hooks/useAmazonSearch';
import { useCreateListing } from '@features/listings/api/listing-hooks';
import { useRouter } from 'next/router';

interface AmazonProductDetailModalProps {
  asin: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AmazonProductDetailModal({
  asin,
  isOpen,
  onClose,
}: AmazonProductDetailModalProps) {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const router = useRouter();
  const createMutation = useCreateListing();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  const { data, isLoading, error } = useAmazonProduct(asin || '', {
    enabled: isOpen && !!asin,
  });

  const product = data?.product;

  if (!isOpen) return null;

  const getAllImages = () => {
    const images: string[] = [];
    if (product?.image) images.push(product.image);
    if (product?.images) {
      product.images.forEach((img) => {
        if (img.link) images.push(img.link);
      });
    }
    return images.length > 0 ? images : [];
  };

  const formatPrice = () => {
    if (!product?.price) return null;
    return product.price.display || (product.price.value ? `${product.price.value}` : null);
  };

  const handleImport = async () => {
    if (!product) return;

    setIsImporting(true);
    try {
      const images = getAllImages();
      const payload: any = {
        title: product.title || '',
        description: product.description || product.feature_bullets?.join('\n') || '',
        images,
        brand: product.brand || '',
        sku: product.asin,
        specifications: product.specifications || {},
      };

      const result = await createMutation.mutateAsync(payload);
      onClose();
      const listingId = (result as any)?.data?.id || (result as any)?.id;
      if (listingId) {
        router.push(`/listings/${listingId}/edit`);
      } else {
        router.push('/listings');
      }
    } catch {
      // Error handled by mutation
    } finally {
      setIsImporting(false);
    }
  };

  const allImages = getAllImages();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        'relative w-full max-w-4xl max-h-[90vh] overflow-y-auto',
        'bg-obsidian-card border border-white/5 rounded-2xl shadow-2xl',
        'animate-in zoom-in-95 duration-200'
      )}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={cn(
            'absolute top-4 z-10 w-10 h-10 rounded-xl',
            'bg-obsidian-outer border border-white/5 flex items-center justify-center',
            'text-zinc-muted hover:text-zinc-text hover:border-white/10 transition-all',
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
                    <img
                      src={allImages[currentImageIndex]}
                      alt={product.title || 'Product'}
                      className="w-full h-full object-cover"
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
                        'shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                        index === currentImageIndex
                          ? 'border-brand'
                          : 'border-white/5 hover:border-white/10'
                      )}
                    >
                      <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
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
                  <h3 className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
                    {t('amazon.description') || 'Description'}
                  </h3>
                  <p className="text-xs text-zinc-text/80 leading-relaxed line-clamp-4">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Features */}
              {product.feature_bullets && product.feature_bullets.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
                    {t('amazon.features') || 'Features'}
                  </h3>
                  <ul className="space-y-1.5">
                    {product.feature_bullets.slice(0, 5).map((feature, index) => (
                      <li key={index} className="text-xs text-zinc-text/70 flex gap-2">
                        <span className="text-brand mt-0.5 shrink-0">&#8226;</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
                    {t('amazon.specifications') || 'Specifications'}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(product.specifications).slice(0, 6).map(([key, value]) => (
                      <div key={key} className="px-3 py-2 rounded-lg bg-obsidian-outer border border-white/5">
                        <p className="text-[9px] text-zinc-muted uppercase tracking-wider">{key}</p>
                        <p className="text-xs font-bold text-zinc-text mt-0.5">
                          {typeof value === 'object' ? (value as any).value : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <AmberButton
                  className="flex-1 h-12 bg-brand text-black font-black rounded-xl gap-2 border-none active:scale-95 transition-all"
                  onClick={handleImport}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  {t('amazon.import_as_listing') || 'Import as Listing'}
                </AmberButton>

                {product.link && (
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'h-12 px-4 rounded-xl flex items-center gap-2',
                      'border border-white/10 text-zinc-muted hover:text-zinc-text hover:border-white/20',
                      'transition-all text-xs font-bold'
                    )}
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t('amazon.view_on_amazon') || 'Amazon'}
                  </a>
                )}
              </div>

              {/* ASIN */}
              <p className="text-[9px] font-mono text-zinc-muted/40 tracking-wider text-center">
                ASIN: {product.asin}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
