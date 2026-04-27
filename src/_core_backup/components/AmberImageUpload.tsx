import React, { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, ZoomIn, ChevronLeft, ChevronRight, Eye, Trash2, GripVertical, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils/cn';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Types ---

export interface AmberImageUploadProps {
  value?: string | string[];
  onChange?: (files: File[]) => void;
  onRemove?: (index: number) => void;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  preview?: boolean;
  disabled?: boolean;
  maxSize?: number;
  className?: string;
  /** External upload progress 0-100 (from useFileUpload hook) */
  uploadProgress?: number;
  /** Whether an upload is in progress */
  isUploading?: boolean;
  /** Upload error message */
  uploadError?: string | null;
  /** Enable drag-to-reorder in preview grid */
  sortable?: boolean;
  /** Called when images are reordered via drag */
  onReorder?: (newOrder: string[]) => void;
}

// --- Utilities ---

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function parseSortableId(id: UniqueIdentifier): number {
  const str = typeof id === 'string' ? id : String(id);
  return parseInt(str.replace('image-', ''), 10);
}

// --- Image Preview Modal ---

interface PreviewModalProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

function ImagePreviewModal({ images, initialIndex, onClose }: PreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loaded, setLoaded] = useState(false);
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

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
  }, [currentIndex, isRTL]);

  const navigate = (delta: number) => {
    setLoaded(false);
    setCurrentIndex(prev => {
      const next = prev + delta;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  if (images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center w-full h-full p-4 sm:p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image counter */}
        <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-bold">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Previous button */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(isRTL ? 1 : -1); }}
            className="absolute left-4 z-20 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Image */}
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
            alt={`Preview ${currentIndex + 1}`}
            onLoad={() => setLoaded(true)}
            className={cn(
              'max-w-full max-h-[85vh] object-contain rounded-lg transition-opacity duration-300',
              loaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        </div>

        {/* Next button */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(isRTL ? -1 : 1); }}
            className="absolute right-4 z-20 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}

// --- Sortable Image Item ---

interface SortableImageItemProps {
  id: string;
  item: { url: string; name: string; size: number };
  index: number;
  hasError: boolean;
  isSortable: boolean;
  disabled: boolean;
  isUploading: boolean;
  uploadProgress?: number;
  isLastItem: boolean;
  onImageError: (index: number) => void;
  onPreview: (index: number) => void;
  onRemove: (e: React.MouseEvent, index: number) => void;
  primaryLabel: string;
}

const SortableImageItem = memo(function SortableImageItem({
  id,
  item,
  index,
  hasError,
  isSortable,
  disabled,
  isUploading,
  uploadProgress,
  isLastItem,
  onImageError,
  onPreview,
  onRemove,
  primaryLabel,
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group overflow-hidden rounded-xl border',
        hasError ? 'border-danger/30' : isDragging ? 'border-brand/50 shadow-lg shadow-brand/10' : 'border-white/10',
        'bg-obsidian-card',
        isDragging && 'ring-2 ring-brand/30'
      )}
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden">
        {!hasError ? (
          <img
            src={item.url}
            alt={`Preview ${index + 1}`}
            onError={() => onImageError(index)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.02] gap-2">
            <AlertCircle className="w-6 h-6 text-danger/50" />
            <p className="text-[10px] text-danger/50 font-bold uppercase">Load Failed</p>
          </div>
        )}
      </div>

      {/* Primary badge */}
      {index === 0 && !hasError && (
        <div className="absolute top-2 start-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand/90 text-black">
          <Star className="w-3 h-3 fill-current" />
          <span className="text-[9px] font-black uppercase tracking-wider">{primaryLabel}</span>
        </div>
      )}

      {/* Hover overlay with actions */}
      {!disabled && !isUploading && !hasError && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center gap-2',
          'bg-black/0 group-hover:bg-black/50 transition-all duration-200',
          'opacity-0 group-hover:opacity-100'
        )}>
          {/* Preview button */}
          <button
            type="button"
            onClick={() => onPreview(index)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-all scale-90 group-hover:scale-100"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          {/* Remove button */}
          <button
            type="button"
            onClick={(e) => onRemove(e, index)}
            className="p-2.5 rounded-xl bg-danger/50 hover:bg-danger text-white transition-all scale-90 group-hover:scale-100"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload progress overlay on specific image */}
      {isUploading && uploadProgress !== undefined && isLastItem && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-2">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
          <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* File info bar with drag handle */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            {isSortable && !disabled && !isUploading && !hasError && (
              <button
                type="button"
                className="p-0.5 rounded cursor-grab active:cursor-grabbing text-white/40 hover:text-white/80 transition-colors shrink-0"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="w-3.5 h-3.5" />
              </button>
            )}
            <p className="text-[10px] text-white/80 truncate">{item.name}</p>
          </div>
          {!disabled && !isUploading && !hasError && (
            <ZoomIn className="w-3 h-3 text-white/40 group-hover:text-white/80 transition-colors shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
});

// --- Image Upload Component ---

export const AmberImageUpload = React.forwardRef<HTMLDivElement, AmberImageUploadProps>(
  (
    {
      value,
      onChange,
      onRemove,
      multiple = false,
      maxFiles = 5,
      accept = 'image/*',
      preview = true,
      disabled = false,
      maxSize = 5 * 1024 * 1024,
      className,
      uploadProgress,
      isUploading = false,
      uploadError,
      sortable = false,
      onReorder,
    },
    ref
  ) => {
    const { t, dir } = useLanguage();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());

    // Convert string URLs to display items
    const displayItems: { url: string; name: string; size: number }[] = Array.isArray(value)
      ? value.map((url, i) => ({ url, name: `image-${i + 1}`, size: 0 }))
      : value
        ? [{ url: value, name: 'image', size: 0 }]
        : [];

    // All valid image URLs for the preview modal
    const previewableImages = displayItems
      .filter((_, i) => !imageLoadErrors.has(i))
      .map(item => item.url);

    // Reset image errors when value changes
    useEffect(() => {
      setImageLoadErrors(new Set());
    }, [value]);

    // DnD sensors
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 5,
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const handleFiles = useCallback(
      (selectedFiles: FileList | File[]) => {
        const newErrors: string[] = [];
        const validFiles: File[] = [];

        Array.from(selectedFiles).forEach((file) => {
          if (!file.type.startsWith('image/')) {
            newErrors.push(t('upload.error_invalid_type') || 'Only image files are allowed');
          } else if (file.size > maxSize) {
            newErrors.push(`File must be smaller than ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
          } else {
            validFiles.push(file);
          }
        });

        setValidationErrors(newErrors);
        if (validFiles.length > 0) {
          onChange?.(validFiles);
        }
      },
      [maxSize, onChange, t]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
      e.target.value = '';
    };

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isUploading) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled || isUploading) return;
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
        handleFiles(droppedFiles);
      }
    };

    const handleClick = () => {
      if (!disabled && !isUploading) {
        inputRef.current?.click();
      }
    };

    const handleImageError = useCallback((index: number) => {
      setImageLoadErrors(prev => new Set(prev).add(index));
    }, []);

    const handleRemove = useCallback((e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      onRemove?.(index);
    }, [onRemove]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const currentUrls = Array.isArray(value) ? [...value] : value ? [value] : [];
      const oldIndex = parseSortableId(active.id);
      const newIndex = parseSortableId(over.id);

      if (isNaN(oldIndex) || isNaN(newIndex)) return;

      const newOrder = arrayMove(currentUrls, oldIndex, newIndex);
      onReorder?.(newOrder);
    }, [value, onReorder]);

    const primaryLabel = t('upload.primary') || 'Primary';
    const sortableIds = useMemo(() => displayItems.map((_, i) => `image-${i}`), [displayItems.length]);

    const previewGrid = (
      <div className={cn(
        'grid gap-3',
        multiple ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'
      )}>
        {displayItems.map((item, index) => (
          <SortableImageItem
            key={sortable ? `image-${index}` : `static-${index}`}
            id={`image-${index}`}
            item={item}
            index={index}
            hasError={imageLoadErrors.has(index)}
            isSortable={sortable}
            disabled={disabled}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            isLastItem={index === displayItems.length - 1}
            onImageError={handleImageError}
            onPreview={setPreviewIndex}
            onRemove={handleRemove}
            primaryLabel={primaryLabel}
          />
        ))}
      </div>
    );

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {/* Upload Area */}
        {(multiple ? displayItems.length < maxFiles : displayItems.length === 0) && (
          <div
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              'relative flex flex-col items-center justify-center',
              'px-6 py-8 border-2 border-dashed rounded-xl',
              'transition-all cursor-pointer',
              isDragging
                ? 'border-brand bg-brand/5 scale-[1.01]'
                : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]',
              (disabled || isUploading) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleInputChange}
              className="sr-only"
              disabled={disabled || isUploading}
            />

            {/* Upload progress overlay */}
            {isUploading && uploadProgress !== undefined && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian-card/90 rounded-xl z-10 gap-3">
                <Loader2 className="w-6 h-6 text-brand animate-spin" />
                <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-muted font-bold uppercase tracking-widest">
                  {uploadProgress}%
                </p>
              </div>
            )}

            <div className={cn(
              'p-3 rounded-full mb-3',
              isDragging ? 'bg-brand/20 text-brand' : 'bg-white/5 text-zinc-muted'
            )}>
              <Upload className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-zinc-text">
                {t('upload.click_or_drag') || 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-zinc-muted">
                {`SVG, PNG, JPG or GIF (max. ${formatFileSize(maxSize)})`}
              </p>
              {multiple && (
                <p className="text-[10px] text-zinc-muted/60 uppercase tracking-widest">
                  {`Up to ${maxFiles} files`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20">
            <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            <ul className="text-xs text-danger space-y-1">
              {validationErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20">
            <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            <p className="text-xs text-danger">{uploadError}</p>
          </div>
        )}

        {/* Preview Grid */}
        {preview && displayItems.length > 0 && (
          sortable ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
                {previewGrid}
              </SortableContext>
            </DndContext>
          ) : (
            previewGrid
          )
        )}

        {/* Image Preview Modal */}
        {previewIndex !== null && previewableImages.length > 0 && (
          <ImagePreviewModal
            images={previewableImages}
            initialIndex={Math.min(previewIndex, previewableImages.length - 1)}
            onClose={() => setPreviewIndex(null)}
          />
        )}
      </div>
    );
  }
);

AmberImageUpload.displayName = 'AmberImageUpload';

// --- Avatar Upload Variant ---

export interface AmberAvatarUploadProps extends Omit<AmberImageUploadProps, 'multiple'> {
  size?: 'sm' | 'md' | 'lg';
  name?: string;
}

export const AmberAvatarUpload = React.forwardRef<
  HTMLDivElement,
  AmberAvatarUploadProps
>(({ value, onChange, onRemove, size = 'md', name, disabled = false, className }, ref) => {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const hasImage = !!value;
  const imageSrc = typeof value === 'string' ? value : (Array.isArray(value) ? value[0] : '') || '';

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <div ref={ref} className={cn('flex items-center gap-4', className)}>
      <div className="relative group">
        <div
          className={cn(
            'rounded-full overflow-hidden border-2 border-white/10',
            sizeClasses[size]
          )}
        >
          {hasImage ? (
            <img
              src={imageSrc}
              alt={t('upload.avatar_preview') || 'Avatar preview'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5">
              <Upload className="w-1/2 h-1/2 text-zinc-muted/50" />
            </div>
          )}
        </div>

        {!disabled && (
          <div
            onClick={handleClick}
            className={cn(
              'absolute inset-0 rounded-full bg-black/50',
              'flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
            )}
          >
            <Upload className="w-6 h-6 text-white" />
          </div>
        )}

        {!disabled && hasImage && (
          <button
            type="button"
            onClick={() => onRemove?.(0)}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-danger text-white hover:bg-danger/80 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-bold text-zinc-text">
          {name || t('upload.profile_photo') || 'Profile Photo'}
        </p>
        <p className="text-xs text-zinc-muted">
          {t('upload.avatar_help') || 'JPG, GIF or PNG. 1MB max.'}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onChange?.([e.target.files[0]]);
          }
        }}
        className="sr-only"
        disabled={disabled}
      />
    </div>
  );
});

AmberAvatarUpload.displayName = 'AmberAvatarUpload';

export default AmberImageUpload;
