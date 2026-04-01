import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils/cn';
import { AmberButton } from './AmberButton';

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
  maxSize?: number; // in bytes
  className?: string;
}

export interface FileWithPreview extends File {
  preview?: string;
}

// --- Image Upload Component ---

/**
 * AmberImageUpload - File upload with drag and drop and preview
 *
 * @example
 * // Single file
 * <AmberImageUpload
 *   value={imageUrl}
 *   onChange={(files) => handleUpload(files[0])}
 * />
 *
 * @example
 * // Multiple files
 * <AmberImageUpload
 *   multiple
 *   maxFiles={5}
 *   value={imageUrls}
 *   onChange={(files) => handleUpload(files)}
 * />
 *
 * @example
 * // With custom max size (5MB)
 * <AmberImageUpload
 *   maxSize={5 * 1024 * 1024}
 *   onChange={handleChange}
 *   onError={(err) => setError(err.message)}
 * />
 */
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
      maxSize = 5 * 1024 * 1024, // 5MB default
      className,
    },
    ref
  ) => {
    const { t, dir } = useLanguage();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [errors, setErrors] = useState<string[]>([]);

    // Convert string URLs to FileWithPreview objects
    const files: FileWithPreview[] = Array.isArray(value)
      ? value.map((url, i) => ({
          name: `image-${i}`,
          size: 0,
          type: 'image',
          preview: url,
        } as FileWithPreview))
      : value
        ? [{
            name: 'image',
            size: 0,
            type: 'image',
            preview: value,
          } as FileWithPreview]
        : [];

    // Validate file
    const validateFile = (file: File): string | null => {
      if (!file.type.startsWith('image/')) {
        return t('upload.error_invalid_type') || 'Only image files are allowed';
      }

      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
        return `File must be smaller than ${maxSizeMB}MB`;
      }

      return null;
    };

    // Handle file selection
    const handleFiles = useCallback(
      (selectedFiles: FileList | File[]) => {
        const newErrors: string[] = [];
        const validFiles: File[] = [];

        Array.from(selectedFiles).forEach((file) => {
          const error = validateFile(file);
          if (error) {
            newErrors.push(error);
          } else {
            validFiles.push(file);
          }
        });

        setErrors(newErrors);

        if (validFiles.length > 0) {
          onChange?.(validFiles);
        }
      },
      [maxSize, onChange]
    );

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    };

    // Handle drag events
    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
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

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
        handleFiles(droppedFiles);
      }
    };

    // Handle click on upload area
    const handleClick = () => {
      if (!disabled) {
        inputRef.current?.click();
      }
    };

    // Handle remove
    const handleRemove = (index: number) => {
      onRemove?.(index);
    };

    // Format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {/* Upload Area */}
        {(multiple ? files.length < maxFiles : files.length === 0) && (
          <div
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              'relative flex flex-col items-center justify-center',
              'px-6 py-8 border-2 border-dashed rounded-lg',
              'transition-colors cursor-pointer',
              isDragging
                ? 'border-brand bg-brand/5'
                : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleInputChange}
              className="sr-only"
              disabled={disabled}
            />

            {/* Icon */}
            <div className={cn(
              'p-3 rounded-full mb-3',
              isDragging ? 'bg-brand/20 text-brand' : 'bg-white/5 text-zinc-muted'
            )}>
              <Upload className="w-6 h-6" />
            </div>

            {/* Text */}
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

        {/* Errors */}
        {errors.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20">
            <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            <ul className="text-xs text-danger space-y-1">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Preview */}
        {preview && files.length > 0 && (
          <div className={cn(
            'grid gap-3',
            multiple ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'
          )}>
            {files.map((file, index) => (
              <div
                key={index}
                className={cn(
                  'relative group overflow-hidden rounded-lg border border-white/10',
                  'bg-obsidian-card'
                )}
              >
                {/* Image Preview */}
                <div className="aspect-square overflow-hidden">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <ImageIcon className="w-8 h-8 text-zinc-muted/50" />
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className={cn(
                      'absolute top-2 right-2 p-1.5 rounded-lg',
                      'bg-black/50 hover:bg-danger text-white',
                      'opacity-0 group-hover:opacity-100 transition-opacity'
                    )}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Upload Progress */}
                {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}

                {/* File Info */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-[10px] text-white truncate">
                    {file.name}
                  </p>
                  {file.size > 0 && (
                    <p className="text-[9px] text-white/70">
                      {formatFileSize(file.size)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
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

/**
 * AmberAvatarUpload - Avatar upload with circular preview
 *
 * @example
 * <AmberAvatarUpload
 *   value={avatarUrl}
 *   onChange={(files) => uploadAvatar(files[0])}
 *   name="John Doe"
 * />
 */
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

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <div ref={ref} className={cn('flex items-center gap-4', className)}>
      {/* Avatar Preview */}
      <div className="relative group">
        <div
          className={cn(
            'rounded-full overflow-hidden border-2 border-white/10',
            sizeClasses[size]
          )}
        >
          {hasImage ? (
            <img
              src={typeof value === 'string' ? value : value[0] || ''}
              alt={t('upload.avatar_preview') || 'Avatar preview'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5">
              <Upload className="w-1/2 h-1/2 text-zinc-muted/50" />
            </div>
          )}
        </div>

        {/* Overlay on hover */}
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

        {/* Remove Button */}
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

      {/* Labels */}
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
