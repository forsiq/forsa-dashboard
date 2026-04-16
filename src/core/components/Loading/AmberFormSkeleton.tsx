import React from 'react';
import { cn } from '../../lib/utils/cn';
import { AmberSkeleton } from '../AmberSkeleton';

// --- Types ---

export interface AmberFormSkeletonProps {
  fields?: number;
  header?: boolean;
  actions?: boolean;
  layout?: 'vertical' | 'inline' | 'grid';
  className?: string;
}

// --- Form Skeleton Component ---

/**
 * AmberFormSkeleton - Form loading placeholder
 *
 * @example
 * // Vertical layout (default)
 * <AmberFormSkeleton fields={6} header actions />
 *
 * @example
 * // Grid layout
 * <AmberFormSkeleton fields={8} layout="grid" />
 */
export const AmberFormSkeleton = React.forwardRef<HTMLDivElement, AmberFormSkeletonProps>(
  (
    {
      fields = 6,
      header = true,
      actions = true,
      layout = 'vertical',
      className,
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('p-6 space-y-6', className)}>
        {/* Header */}
        {header && (
          <div className="space-y-2">
            <AmberSkeleton variant="text" className="h-6 w-1/4" />
            <AmberSkeleton variant="text" className="h-4 w-1/3" />
          </div>
        )}

        {/* Fields */}
        {layout === 'vertical' && (
          <div className="space-y-4">
            {Array.from({ length: fields }).map((_, i) => (
              <FormFieldSkeleton key={i} />
            ))}
          </div>
        )}

        {layout === 'inline' && (
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: Math.min(fields, 4) }).map((_, i) => (
              <FormFieldSkeleton key={i} className="flex-1 min-w-[200px]" />
            ))}
          </div>
        )}

        {layout === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: fields }).map((_, i) => (
              <FormFieldSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <AmberSkeleton variant="rectangular" width={100} height={40} />
            <AmberSkeleton variant="rectangular" width={100} height={40} />
          </div>
        )}
      </div>
    );
  }
);

AmberFormSkeleton.displayName = 'AmberFormSkeleton';

// --- Form Field Skeleton ---

export interface FormFieldSkeletonProps {
  label?: boolean;
  inputHeight?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * FormFieldSkeleton - Single form field placeholder
 */
export const FormFieldSkeleton = React.forwardRef<HTMLDivElement, FormFieldSkeletonProps>(
  ({ label = true, inputHeight = 'md', className }, ref) => {
    const heights = {
      sm: 'h-9',
      md: 'h-11',
      lg: 'h-12',
    };

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {label && <AmberSkeleton variant="text" className="h-4 w-1/4" />}
        <AmberSkeleton variant="rectangular" className={cn('w-full', heights[inputHeight])} />
      </div>
    );
  }
);

FormFieldSkeleton.displayName = 'FormFieldSkeleton';

// --- Filter Form Skeleton ---

export interface FilterFormSkeletonProps {
  fields?: number;
  className?: string;
}

/**
 * FilterFormSkeleton - Filter form placeholder for list pages
 *
 * @example
 * <FilterFormSkeleton fields={4} />
 */
export const FilterFormSkeleton = React.forwardRef<HTMLDivElement, FilterFormSkeletonProps>(
  ({ fields = 4, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-wrap items-end gap-4 p-4 border border-white/5 rounded-lg bg-obsidian-card',
          className
        )}
      >
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="flex-1 min-w-[150px] space-y-2">
            <AmberSkeleton variant="text" className="h-4 w-16" />
            <AmberSkeleton variant="rectangular" className="w-full h-11" />
          </div>
        ))}
        <div className="flex gap-2">
          <AmberSkeleton variant="rectangular" width={80} height={42} />
          <AmberSkeleton variant="rectangular" width={80} height={42} />
        </div>
      </div>
    );
  }
);

FilterFormSkeleton.displayName = 'FilterFormSkeleton';

// --- Settings Form Skeleton ---

export interface SettingsFormSkeletonProps {
  sections?: number;
  fieldsPerSection?: number;
  className?: string;
}

/**
 * SettingsFormSkeleton - Settings page form placeholder
 *
 * @example
 * <SettingsFormSkeleton sections={3} fieldsPerSection={4} />
 */
export const SettingsFormSkeleton = React.forwardRef<
  HTMLDivElement,
  SettingsFormSkeletonProps
>(({ sections = 3, fieldsPerSection = 4, className }, ref) => {
  return (
    <div ref={ref} className={cn('space-y-6', className)}>
      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="border border-white/5 rounded-lg bg-obsidian-card overflow-hidden"
        >
          {/* Section Header */}
          <div className="px-6 py-4 border-b border-white/5 space-y-2">
            <AmberSkeleton variant="text" className="h-5 w-1/3" />
            <AmberSkeleton variant="text" className="h-4 w-1/2" />
          </div>

          {/* Section Fields */}
          <div className="p-6 space-y-4">
            {Array.from({ length: fieldsPerSection }).map((_, fieldIndex) => (
              <FormFieldSkeleton key={fieldIndex} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

SettingsFormSkeleton.displayName = 'SettingsFormSkeleton';

// --- Login Form Skeleton ---

export interface LoginFormSkeletonProps {
  className?: string;
}

/**
 * LoginFormSkeleton - Login form placeholder
 *
 * @example
 * <LoginFormSkeleton />
 */
export const LoginFormSkeleton = React.forwardRef<HTMLDivElement, LoginFormSkeletonProps>(
  ({ className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'p-8 space-y-6 max-w-md mx-auto border border-white/5 rounded-lg bg-obsidian-card',
          className
        )}
      >
        {/* Logo/Title */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto">
            <AmberSkeleton variant="circular" width={64} height={64} />
          </div>
          <AmberSkeleton variant="text" className="h-7 w-32 mx-auto" />
          <AmberSkeleton variant="text" className="h-4 w-48 mx-auto" />
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <FormFieldSkeleton />
          <FormFieldSkeleton />
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <AmberSkeleton variant="rectangular" className="w-full h-11" />
          <div className="flex justify-between">
            <AmberSkeleton variant="text" className="h-4 w-24" />
            <AmberSkeleton variant="text" className="h-4 w-32" />
          </div>
        </div>
      </div>
    );
  }
);

LoginFormSkeleton.displayName = 'LoginFormSkeleton';

export default AmberFormSkeleton;
