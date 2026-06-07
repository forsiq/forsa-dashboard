import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';

export interface AmberLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  alt?: string;
}

export function AmberLightbox({
  images,
  initialIndex = 0,
  onClose,
  alt = 'Image',
}: AmberLightboxProps) {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const navigate = (delta: number) => {
    setLoaded(false);
    setCurrentIndex((prev) => {
      const next = prev + delta;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') navigate(isRTL ? -1 : 1);
      if (e.key === 'ArrowLeft') navigate(isRTL ? 1 : -1);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [currentIndex, isRTL, onClose]);

  if (images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" />

      <div className="relative z-10 flex items-center justify-center w-full h-full p-4 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 z-20 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
          aria-label="Close preview"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="absolute top-4 start-4 z-20 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-bold">
          {currentIndex + 1} / {images.length}
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(isRTL ? 1 : -1);
            }}
            className="absolute start-4 z-20 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Previous image"
          >
            <ChevronLeft className={cn('w-6 h-6', isRTL && 'rotate-180')} />
          </button>
        )}

        <div
          className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
            </div>
          )}
          <img
            src={images[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            onLoad={() => setLoaded(true)}
            className={cn(
              'max-w-full max-h-[85vh] object-contain rounded-lg transition-opacity duration-300',
              loaded ? 'opacity-100' : 'opacity-0',
            )}
          />
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(isRTL ? -1 : 1);
            }}
            className="absolute end-4 z-20 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Next image"
          >
            <ChevronRight className={cn('w-6 h-6', isRTL && 'rotate-180')} />
          </button>
        )}
      </div>
    </div>
  );
}
