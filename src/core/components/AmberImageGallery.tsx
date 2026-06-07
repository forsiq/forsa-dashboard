import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberLightbox } from './AmberLightbox';

export interface AmberImageGalleryProps {
  images: string[];
  alt?: string;
  /** Tailwind height classes for the main image area, e.g. "h-[280px]" */
  height?: string;
  /** Optional overlay nodes rendered on top of the main image */
  overlay?: React.ReactNode;
  /** Thumbnail grid columns when multiple images (default: 4 on mobile, 5 on sm+) */
  thumbnailCols?: string;
  className?: string;
}

export function AmberImageGallery({
  images,
  alt = 'Gallery image',
  height = 'h-[220px] md:h-[280px] lg:h-[320px]',
  overlay,
  thumbnailCols = 'grid-cols-4 sm:grid-cols-5',
  className,
}: AmberImageGalleryProps) {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const [viewIndex, setViewIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setViewIndex(0);
  }, [images]);

  const hasMultiple = images.length > 1;
  const currentUrl = images[viewIndex] ?? images[0];

  const navigateView = useCallback(
    (delta: number) => {
      setViewIndex((prev) => {
        const len = images.length;
        if (len <= 1) return 0;
        let next = prev + delta;
        if (next < 0) next = len - 1;
        if (next >= len) next = 0;
        return next;
      });
    },
    [images.length],
  );

  const openLightbox = useCallback(() => {
    if (images.length > 0) setLightboxOpen(true);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className={cn(
          'relative rounded-lg border border-white/5 bg-black overflow-hidden group',
          height,
        )}
      >
        <button
          type="button"
          onClick={openLightbox}
          className="absolute inset-0 z-0 w-full h-full cursor-zoom-in"
          aria-label="Open image preview"
        >
          <img
            src={currentUrl}
            alt={`${alt} ${viewIndex + 1}`}
            className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          />
        </button>

        {overlay}

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigateView(isRTL ? 1 : -1);
              }}
              className="absolute start-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className={cn('w-4 h-4', isRTL && 'rotate-180')} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigateView(isRTL ? -1 : 1);
              }}
              className="absolute end-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-all"
              aria-label="Next image"
            >
              <ChevronRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
            </button>
            <div className="absolute start-2 bottom-2 z-10 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-bold pointer-events-none">
              {viewIndex + 1} / {images.length}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openLightbox();
          }}
          className="absolute end-2 bottom-2 z-10 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-all"
          aria-label="Zoom image"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {hasMultiple && (
        <div className={cn('grid gap-2', thumbnailCols)}>
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setViewIndex(i)}
              className={cn(
                'aspect-square rounded-md overflow-hidden border-2 transition-all',
                i === viewIndex
                  ? 'border-brand ring-1 ring-brand/40'
                  : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/25',
              )}
            >
              <img
                src={src}
                alt={`${alt} thumb ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <AmberLightbox
          images={images}
          initialIndex={viewIndex}
          onClose={() => setLightboxOpen(false)}
          alt={alt}
        />
      )}
    </div>
  );
}
