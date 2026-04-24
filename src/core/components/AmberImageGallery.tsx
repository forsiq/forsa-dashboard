import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, AlertCircle, ImageIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils/cn';
import { AmberLightbox } from './AmberLightbox';

export interface AmberImageGalleryProps {
  images: string[];
  alt?: string;
  className?: string;
  height?: string;
  overlay?: React.ReactNode;
}

export const AmberImageGallery: React.FC<AmberImageGalleryProps> = ({
  images,
  alt = 'Image',
  className = '',
  height = 'h-[300px] lg:h-[460px]',
  overlay,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';

  const validImages = images.filter((_, i) => !imageErrors.has(i));
  const hasMultiple = validImages.length > 1;

  const navigate = (delta: number) => {
    setCurrentIndex(prev => {
      let next = prev + delta;
      if (next < 0) next = validImages.length - 1;
      if (next >= validImages.length) next = 0;
      return next;
    });
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
    if (currentIndex === index && index < validImages.length - 1) {
      setCurrentIndex(Math.min(index + 1, validImages.length - 1));
    }
  };

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
  };

  if (validImages.length === 0) {
    return (
      <div className={cn('relative rounded-xl border border-white/5 bg-obsidian-card flex items-center justify-center', height, className)}>
        <div className="text-center space-y-3">
          <ImageIcon className="w-12 h-12 text-zinc-muted/20 mx-auto" />
          <p className="text-sm text-zinc-muted font-semibold">
            {t('auction.detail.no_images') || 'لا توجد صور متاحة'}
          </p>
        </div>
      </div>
    );
  }

  const currentUrl = validImages[currentIndex] || validImages[0];

  return (
    <>
      <div className={cn('relative rounded-xl border border-white/5 bg-black overflow-hidden group', height, className)}>
        {/* Main Image */}
        <div className="relative w-full h-full">
          {!loadedImages.has(currentIndex) && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <img
            src={currentUrl}
            alt={`${alt} ${currentIndex + 1}`}
            onError={() => handleImageError(currentIndex)}
            onLoad={() => handleImageLoad(currentIndex)}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700"
          />

          {/* Overlay content passed from parent */}
          {overlay}

          {/* Navigation arrows on main image */}
          {hasMultiple && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(isRTL ? 1 : -1); }}
                className="absolute start-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-lg bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all"
              >
                <ChevronLeft className={cn('w-5 h-5', isRTL && 'rotate-180')} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(isRTL ? -1 : 1); }}
                className="absolute end-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-lg bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all"
              >
                <ChevronRight className={cn('w-5 h-5', isRTL && 'rotate-180')} />
              </button>
            </>
          )}

          {/* Zoom button */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
            className="absolute end-3 bottom-3 z-20 p-2 rounded-lg bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Image counter */}
          {hasMultiple && (
            <div className="absolute start-3 bottom-3 z-20 px-2 py-1 rounded-md bg-black/40 text-white text-[10px] font-bold">
              {currentIndex + 1} / {validImages.length}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {hasMultiple && (
          <div className="absolute bottom-0 inset-x-0 z-10 px-3 pb-3 pointer-events-none">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 scrollbar-hide pointer-events-auto bg-black/30 backdrop-blur-sm rounded-lg mx-auto max-w-fit">
              {validImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    'w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden border-2 shrink-0 transition-all',
                    i === currentIndex
                      ? 'border-brand scale-105'
                      : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/40'
                  )}
                >
                  <img
                    src={src}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <AmberLightbox
          images={validImages}
          initialIndex={currentIndex}
          onClose={() => setLightboxOpen(false)}
          alt={alt}
        />
      )}
    </>
  );
};

export default AmberImageGallery;
