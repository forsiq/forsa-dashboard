import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils/cn';

export interface AmberLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  alt?: string;
}

export const AmberLightbox: React.FC<AmberLightboxProps> = ({
  images,
  initialIndex = 0,
  onClose,
  alt,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loaded, setLoaded] = useState(false);
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const touchStartX = useRef<number | null>(null);

  const navigate = useCallback((delta: number) => {
    if (images.length <= 1) return;
    setLoaded(false);
    setCurrentIndex(prev => {
      const next = prev + delta;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  }, [images.length]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setLoaded(false);
  }, [initialIndex]);

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
  }, [navigate, onClose, isRTL]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      navigate(diff > 0 ? (isRTL ? -1 : 1) : (isRTL ? 1 : -1));
    }
    touchStartX.current = null;
  };

  if (images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" />

      <div
        className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4 sm:p-8"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-bold">
          {currentIndex + 1} / {images.length}
        </div>

        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(isRTL ? 1 : -1); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div
          className="relative max-w-[90vw] max-h-[80vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
            </div>
          )}
          <img
            src={images[currentIndex]}
            alt={alt ? `${alt} ${currentIndex + 1}` : `Image ${currentIndex + 1}`}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            className={cn(
              'max-w-full max-h-[80vh] object-contain rounded-lg transition-opacity duration-300',
              loaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        </div>

        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(isRTL ? -1 : 1); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {images.length > 1 && (
          <div className="flex items-center gap-2 mt-4 pb-2 overflow-x-auto max-w-[80vw] px-2">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); setLoaded(false); }}
                className={cn(
                  'w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all',
                  i === currentIndex
                    ? 'border-brand scale-110'
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
        )}
      </div>
    </div>
  );
};

export default AmberLightbox;
