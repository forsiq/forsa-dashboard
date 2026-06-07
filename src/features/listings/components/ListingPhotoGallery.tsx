import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AmberImageUpload } from '@core/components/AmberImageUpload';
import { AmberLightbox } from '@core/components/AmberLightbox';
import { AmberButton } from '@core/components/AmberButton';
import { usePendingImageFiles } from '@core/hooks/usePendingImageFiles';
import { useFileUpload } from '@core/hooks/useFileUpload';
import { useUpdateListing } from '../api/listing-hooks';
import { useLanguage } from '@core/contexts/LanguageContext';
import { Loader2, Check, Pencil, X, Package, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';

interface ListingPhotoGalleryProps {
  listingId: number;
  initialImages: string[];
  initialAttachmentIds: number[];
  listingTitle: string;
}

export function ListingPhotoGallery({
  listingId,
  initialImages,
  initialAttachmentIds,
  listingTitle,
}: ListingPhotoGalleryProps) {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const updateListing = useUpdateListing();
  const imageUpload = usePendingImageFiles(initialImages);
  const { uploadMultiple, isUploading, progress: uploadProgress, error: uploadError } = useFileUpload();

  const [retainedAttachmentIds, setRetainedAttachmentIds] = useState<number[]>(initialAttachmentIds);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isEditing, setIsEditing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset when listing data changes or when exiting edit mode
  useEffect(() => {
    if (!isEditing) {
      imageUpload.resetFromServer(initialImages);
      setRetainedAttachmentIds(initialAttachmentIds);
    }
  }, [initialImages, initialAttachmentIds, isEditing]);

  const savePhotos = useCallback(async (
    newRetainedIds: number[],
    pendingFiles: File[],
  ) => {
    try {
      setSaveStatus('saving');

      const newAttachmentIds = pendingFiles.length > 0
        ? await uploadMultiple(pendingFiles)
        : [];

      const allAttachmentIds = [...newRetainedIds, ...newAttachmentIds];

      await updateListing.mutateAsync({
        id: listingId,
        data: {
          mainAttachmentId: allAttachmentIds[0] || undefined,
          attachmentIds: allAttachmentIds,
        } as any,
      });

      // Update local state so the grid stays in sync until server data arrives
      setRetainedAttachmentIds(allAttachmentIds);
      if (newAttachmentIds.length > 0) {
        // Clear pending files — previews now come from the server via props
        imageUpload.resetFromServer(imageUpload.previewUrls);
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [listingId, uploadMultiple, updateListing]);

  const debouncedSave = useCallback((newRetainedIds: number[]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      savePhotos(newRetainedIds, []);
    }, 500);
  }, [savePhotos]);

  const handleRemove = useCallback((index: number) => {
    const existingCount = imageUpload.previewUrls.length - imageUpload.pendingFiles.length;
    let newRetainedIds = retainedAttachmentIds;

    if (index < existingCount) {
      newRetainedIds = retainedAttachmentIds.filter((_, i) => i !== index);
      setRetainedAttachmentIds(newRetainedIds);
    }

    imageUpload.removeAt(index);
    debouncedSave(newRetainedIds);
  }, [imageUpload, retainedAttachmentIds, debouncedSave]);

  const handleReorder = useCallback((newOrder: string[]) => {
    const existingCount = imageUpload.previewUrls.length - imageUpload.pendingFiles.length;
    const newRetainedIds: number[] = [];

    for (let i = 0; i < existingCount && i < newOrder.length; i++) {
      const oldIndex = imageUpload.previewUrls.indexOf(newOrder[i]);
      if (oldIndex >= 0 && oldIndex < retainedAttachmentIds.length) {
        newRetainedIds.push(retainedAttachmentIds[oldIndex]);
      } else if (i < retainedAttachmentIds.length) {
        newRetainedIds.push(retainedAttachmentIds[i]);
      }
    }

    if (newRetainedIds.length === 0 && existingCount > 0) {
      newRetainedIds.push(...retainedAttachmentIds.slice(0, existingCount));
    }

    setRetainedAttachmentIds(newRetainedIds);
    imageUpload.reorder(newOrder);
    debouncedSave(newRetainedIds);
  }, [imageUpload, retainedAttachmentIds, debouncedSave]);

  const handleUpload = useCallback(async (files: File[]) => {
    if (!files?.length) return;
    imageUpload.appendFiles(files);
    await savePhotos(retainedAttachmentIds, files);
  }, [imageUpload, retainedAttachmentIds, savePhotos]);

  const isSaving = saveStatus === 'saving' || isUploading;
  const [viewIndex, setViewIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setViewIndex(0);
  }, [initialImages]);

  const navigateView = useCallback((delta: number) => {
    setViewIndex((prev) => {
      const len = initialImages.length;
      if (len <= 1) return 0;
      let next = prev + delta;
      if (next < 0) next = len - 1;
      if (next >= len) next = 0;
      return next;
    });
  }, [initialImages.length]);

  // View mode: main image + thumbnail strip + lightbox + edit button
  if (!isEditing) {
    const hasMultiple = initialImages.length > 1;
    const currentUrl = initialImages[viewIndex] ?? initialImages[0];

    return (
      <div className="space-y-3">
        {initialImages.length > 0 ? (
          <>
            <div className="relative h-[220px] md:h-[280px] lg:h-[320px] rounded-lg border border-white/5 bg-black overflow-hidden group">
              <img
                src={currentUrl}
                alt={`${listingTitle} ${viewIndex + 1}`}
                className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
              />
              {hasMultiple && (
                <>
                  <button
                    type="button"
                    onClick={() => navigateView(isRTL ? 1 : -1)}
                    className="absolute start-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className={cn('w-4 h-4', isRTL && 'rotate-180')} />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateView(isRTL ? -1 : 1)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
                  </button>
                  <div className="absolute start-2 bottom-2 z-10 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-bold">
                    {viewIndex + 1} / {initialImages.length}
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute end-2 bottom-2 z-10 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-all"
                aria-label="Zoom image"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            {hasMultiple && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {initialImages.map((src, i) => (
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
                    <img src={src} alt={`${listingTitle} thumb ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {lightboxOpen && (
              <AmberLightbox
                images={initialImages}
                initialIndex={viewIndex}
                onClose={() => setLightboxOpen(false)}
                alt={listingTitle}
              />
            )}
          </>
        ) : (
          <div className="aspect-square min-h-[280px] bg-obsidian-outer rounded-lg flex items-center justify-center border border-white/5">
            <Package className="w-10 h-10 text-zinc-muted/30" />
          </div>
        )}
        <AmberButton
          variant="outline"
          className="w-full h-9 text-[11px] font-black uppercase tracking-widest gap-2 border-dashed border-white/10 hover:border-brand hover:text-brand transition-all"
          onClick={() => {
            imageUpload.resetFromServer(initialImages);
            setRetainedAttachmentIds(initialAttachmentIds);
            setIsEditing(true);
          }}
        >
          <Pencil className="w-3.5 h-3.5" />
          {t('listing.edit_photos') || 'Manage Photos'}
        </AmberButton>
      </div>
    );
  }

  // Edit mode: sortable upload grid
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black text-brand uppercase tracking-widest">
          {t('listing.editing_photos') || 'Editing Photos'}
        </span>
        <div className="flex items-center gap-2">
          {saveStatus !== 'idle' && (
            <span className={cn(
              'flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest',
              saveStatus === 'saving' && 'text-info',
              saveStatus === 'saved' && 'text-success',
              saveStatus === 'error' && 'text-danger',
            )}>
              {saveStatus === 'saving' && <Loader2 className="w-3 h-3 animate-spin" />}
              {saveStatus === 'saved' && <Check className="w-3 h-3" />}
              {saveStatus === 'saving' && (t('common.saving') || 'Saving...')}
              {saveStatus === 'saved' && (t('common.saved') || 'Saved')}
              {saveStatus === 'error' && (t('common.error_occurred') || 'Error')}
            </span>
          )}
          <button
            onClick={() => setIsEditing(false)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-muted hover:text-zinc-text transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AmberImageUpload
        value={imageUpload.previewUrls}
        onChange={(files) => {
          if (files?.length) handleUpload(files);
        }}
        onRemove={handleRemove}
        onReorder={handleReorder}
        multiple={true}
        sortable={true}
        disabled={isSaving}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        uploadError={uploadError}
      />
      <p className="text-[10px] text-zinc-muted font-bold uppercase tracking-widest text-center">
        {t('common.image_upload_hint') || 'PNG, JPG up to 10MB. Drag to reorder — first image is the cover.'}
      </p>
    </div>
  );
}
