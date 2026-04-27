import React, { useState, useRef, useEffect } from 'react';
import { User, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils/cn';

// --- Types ---

export interface AmberAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circular' | 'rounded' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away';
  bordered?: boolean;
}

export interface AmberAvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  onLoadingStatusChange?: (status: 'loading' | 'loaded' | 'error') => void;
}

export interface AmberAvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  delayMs?: number;
}

// --- Helper Functions ---

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];

  return colors[Math.abs(hash) % colors.length];
}

// --- Root Avatar Component ---

/**
 * AmberAvatar - User avatar with image, fallback, and status
 *
 * @example
 * // With initials fallback
 * <AmberAvatar fallback="John Doe" />
 *
 * @example
 * // With image
 * <AmberAvatar src="/avatar.jpg" alt="User" />
 *
 * @example
 * // With status indicator
 * <AmberAvatar src="/avatar.jpg" status="online" />
 *
 * @example
 * // Different sizes
 * <AmberAvatar size="lg" fallback="JD" />
 */
export const AmberAvatar = React.forwardRef<HTMLDivElement, AmberAvatarProps>(
  (
    {
      src,
      alt,
      fallback,
      size = 'md',
      variant = 'circular',
      status,
      bordered = false,
      className,
      ...props
    },
    ref
  ) => {
    const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>(
      src ? 'loading' : 'error'
    );
    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
      if (!src) {
        setImageStatus('error');
        setShowFallback(true);
        return;
      }

      setImageStatus('loading');
      setShowFallback(false);

      const img = new Image();
      img.onload = () => {
        setImageStatus('loaded');
        setShowFallback(false);
      };
      img.onerror = () => {
        setImageStatus('error');
        setShowFallback(true);
      };
      img.src = src;
    }, [src]);

    // Size classes
    const sizeClasses = {
      xs: 'w-6 h-6 text-[10px]',
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-lg',
      '2xl': 'w-20 h-20 text-xl',
    };

    // Variant classes
    const variantClasses = {
      circular: 'rounded-full',
      rounded: 'rounded-xl',
      square: 'rounded-lg',
    };

    // Status indicator classes
    const statusClasses = {
      online: 'bg-success',
      offline: 'bg-zinc-muted',
      busy: 'bg-danger',
      away: 'bg-warning',
    };

    const initials = fallback ? getInitials(fallback) : null;
    const backgroundColor = initials ? stringToColor(fallback) : 'bg-zinc-card';

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex shrink-0', className)}
        {...props}
      >
        <div
          className={cn(
            'flex items-center justify-center',
            'font-bold text-obsidian-outer',
            sizeClasses[size],
            variantClasses[variant],
            bordered && 'ring-2 ring-white/10',
            (!src || imageStatus === 'error') && backgroundColor
          )}
        >
          {imageStatus === 'loading' && (
            <Loader2 className="w-1/2 h-1/2 animate-spin text-zinc-muted" />
          )}

          {imageStatus === 'error' && (
            <>
              {initials ? (
                <span>{initials}</span>
              ) : (
                <User className="w-1/2 h-1/2 text-zinc-muted" />
              )}
            </>
          )}

          {imageStatus === 'loaded' && src && (
            <img
              src={src}
              alt={alt}
              className={cn(
                'w-full h-full object-cover',
                variantClasses[variant]
              )}
            />
          )}
        </div>

        {/* Status Indicator */}
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 block rounded-full ring-2 ring-obsidian-card',
              statusClasses[status],
              {
                'w-2 h-2': size === 'xs' || size === 'sm',
                'w-2.5 h-2.5': size === 'md',
                'w-3 h-3': size === 'lg' || size === 'xl',
                'w-3.5 h-3.5': size === '2xl',
              }
            )}
          />
        )}
      </div>
    );
  }
);

AmberAvatar.displayName = 'AmberAvatar';

// --- Avatar Image Component (for advanced usage) ---

/**
 * AmberAvatarImage - Image component for avatar with loading states
 *
 * @example
 * <AmberAvatar>
 *   <AmberAvatarImage src="/avatar.jpg" />
 *   <AmberAvatarFallback>JD</AmberAvatarFallback>
 * </AmberAvatar>
 */
export const AmberAvatarImage = React.forwardRef<
  HTMLImageElement,
  AmberAvatarImageProps
>(({ className, onLoadingStatusChange, ...props }, ref) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    setStatus('loading');
  }, [props.src]);

  const handleLoad = () => {
    setStatus('loaded');
    onLoadingStatusChange?.('loaded');
  };

  const handleError = () => {
    setStatus('error');
    onLoadingStatusChange?.('error');
  };

  if (status === 'error') {
    return null;
  }

  return (
    <img
      ref={ref}
      className={cn(
        'aspect-square h-full w-full object-cover',
        status === 'loading' && 'opacity-0',
        className
      )}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
});

AmberAvatarImage.displayName = 'AmberAvatarImage';

// --- Avatar Fallback Component ---

/**
 * AmberAvatarFallback - Fallback content for avatar
 *
 * @example
 * <AmberAvatar>
 *   <AmberAvatarImage src="/avatar.jpg" />
 *   <AmberAvatarFallback delayMs={200}>
 *     <User className="w-4 h-4" />
 *   </AmberAvatarFallback>
 * </AmberAvatar>
 */
export const AmberAvatarFallback = React.forwardRef<
  HTMLDivElement,
  AmberAvatarFallbackProps
>(({ className, delayMs = 0, children, ...props }, ref) => {
  const [show, setShow] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs === 0) return;

    const timer = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  if (!show) return null;

  return (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-zinc-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

AmberAvatarFallback.displayName = 'AmberAvatarFallback';

// --- Avatar Group ---

export interface AmberAvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/**
 * AmberAvatarGroup - Stacked avatar display for multiple users
 *
 * @example
 * <AmberAvatarGroup max={3}>
 *   <AmberAvatar src="/avatar1.jpg" alt="User 1" />
 *   <AmberAvatar src="/avatar2.jpg" alt="User 2" />
 *   <AmberAvatar src="/avatar3.jpg" alt="User 3" />
 *   <AmberAvatar src="/avatar4.jpg" alt="User 4" />
 * </AmberAvatarGroup>
 */
export const AmberAvatarGroup = React.forwardRef<
  HTMLDivElement,
  AmberAvatarGroupProps
>(({ children, max, size = 'md', className, ...props }, ref) => {
  const avatars = React.Children.toArray(children);
  const visibleAvatars = max ? avatars.slice(0, max) : avatars;
  const remainingCount = max ? avatars.length - max : 0;

  // Negative margin for stacking effect
  const negativeMargin = {
    xs: '-ml-2',
    sm: '-ml-2.5',
    md: '-ml-3',
    lg: '-ml-3.5',
    xl: '-ml-4',
    '2xl': '-ml-5',
  };

  return (
    <div ref={ref} className={cn('flex items-center', className)} {...props}>
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className={cn(
            'relative border-2 border-obsidian-card',
            index > 0 && negativeMargin[size]
          )}
        >
          {avatar}
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={cn(
            'relative flex items-center justify-center',
            'rounded-full bg-obsidian-card border-2 border-obsidian-card',
            'font-bold text-xs text-zinc-muted',
            negativeMargin[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
});

AmberAvatarGroup.displayName = 'AmberAvatarGroup';

export default AmberAvatar;
