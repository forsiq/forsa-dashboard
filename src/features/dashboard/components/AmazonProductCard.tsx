import React from 'react';
import { Star, Check, Play } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';
import type { AmazonSearchResult } from '@services/amazon/api/amazon-api';

interface AmazonProductCardProps {
  product: AmazonSearchResult;
  onClick: (asin: string) => void;
}

export function AmazonProductCard({ product, onClick }: AmazonProductCardProps) {
  const getImageUrl = () => {
    if (product.image) return product.image;
    if (product.images && product.images.length > 0) {
      return product.images[0].link;
    }
    return '';
  };

  const formatPrice = () => {
    if (!product.price) return null;
    return product.price.display || (product.price.value ? `${product.price.value}` : null);
  };

  const imageUrl = getImageUrl();

  return (
    <button
      onClick={() => onClick(product.asin)}
      className={cn(
        'group w-full text-left rounded-2xl border border-white/5 bg-obsidian-card',
        'hover:border-brand/20 hover:shadow-[0_0_20px_rgba(245,196,81,0.05)]',
        'transition-all duration-300 overflow-hidden active:scale-[0.98]',
        'focus:outline-none focus:ring-2 focus:ring-brand/30'
      )}
    >
      {/* Image */}
      <div className="relative aspect-square bg-obsidian-outer overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title || 'Product'}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-zinc-muted/30 text-sm font-bold">No Image</span>
          </div>
        )}
        {product.is_prime && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-blue-600/90 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-white" />
              <span className="text-[9px] font-black text-white uppercase tracking-wider">Prime</span>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="text-xs font-black text-zinc-text uppercase tracking-tight leading-snug line-clamp-2 min-h-[2.5em]">
          {product.title}
        </h3>

        {formatPrice() && (
          <p className="text-sm font-black text-brand tracking-tight">
            {formatPrice()}
          </p>
        )}

        {product.rating && (
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-zinc-text">{product.rating}</span>
            {product.ratings_total && (
              <span className="text-[10px] text-zinc-muted font-bold">
                ({product.ratings_total.toLocaleString()})
              </span>
            )}
          </div>
        )}

        <p className="text-[9px] font-mono text-zinc-muted/50 tracking-wider">
          ASIN: {product.asin}
        </p>
      </div>
    </button>
  );
}
