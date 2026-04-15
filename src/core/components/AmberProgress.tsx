import React from 'react';
import { cn } from '../lib/utils/cn';

// --- Types ---

export interface AmberProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  indeterminate?: boolean;
  striped?: boolean;
  animated?: boolean;
}

// --- Progress Component ---

/**
 * AmberProgress - Progress bar indicator
 *
 * @example
 * // Basic progress
 * <AmberProgress value={75} />
 *
 * @example
 * // With label
 * <AmberProgress value={50} showLabel />
 *
 * @example
 * // Indeterminate (loading state)
 * <AmberProgress indeterminate />
 *
 * @example
 * // Success variant with stripes
 * <AmberProgress value={100} variant="success" striped animated />
 */
export const AmberProgress = React.forwardRef<HTMLDivElement, AmberProgressProps>(
  (
    {
      value = 0,
      max = 100,
      size = 'md',
      variant = 'default',
      showLabel = false,
      label,
      indeterminate = false,
      striped = false,
      animated = false,
      className,
      ...props
    },
    ref
  ) => {
    // Calculate percentage
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    // Size classes
    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };

    // Variant classes for the bar
    const variantClasses = {
      default: 'bg-zinc-muted',
      primary: 'bg-brand',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
    };

    // Background classes for the track
    const trackClasses = {
      default: 'bg-white/5',
      primary: 'bg-brand/10',
      success: 'bg-success/10',
      warning: 'bg-warning/10',
      danger: 'bg-danger/10',
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {/* Label Row */}
        {(showLabel || label !== undefined) && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-muted uppercase tracking-widest">
              {label || `${Math.round(percentage)}%`}
            </span>
            {showLabel && label === undefined && (
              <span className="text-xs font-mono text-zinc-muted">
                {value} / {max}
              </span>
            )}
          </div>
        )}

        {/* Progress Track */}
        <div
          className={cn(
            'relative overflow-hidden rounded-full w-full',
            sizeClasses[size],
            trackClasses[variant]
          )}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        >
          {/* Progress Bar */}
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              variantClasses[variant],
              indeterminate && 'animate-[indeterminate_1.5s_ease-in-out_infinite]'
            )}
            style={{
              width: indeterminate ? '30%' : `${percentage}%`,
              ...(indeterminate && {
                animationDirection: 'reverse',
              }),
            }}
          />
        </div>
      </div>
    );
  }
);

AmberProgress.displayName = 'AmberProgress';

// --- Circular Progress ---

export interface AmberCircularProgressProps extends Omit<AmberProgressProps, 'size'> {
  size?: number; // pixel size
  strokeWidth?: number;
}

/**
 * AmberCircularProgress - Circular progress indicator
 *
 * @example
 * <AmberCircularProgress value={75} size={80} />
 *
 * @example
 * // Small indeterminate
 * <AmberCircularProgress indeterminate size={40} />
 */
export const AmberCircularProgress = React.forwardRef<
  HTMLDivElement,
  AmberCircularProgressProps
>(
  (
    {
      value = 0,
      max = 100,
      size = 80,
      strokeWidth = 8,
      variant = 'primary',
      showLabel = false,
      label,
      indeterminate = false,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = indeterminate
      ? circumference * 0.25
      : circumference - (percentage / 100) * circumference;

    const variantColors = {
      default: 'text-zinc-muted',
      primary: 'text-brand',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
    };

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          className={cn('transform -rotate-90', variantColors[variant])}
          width={size}
          height={size}
        >
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="opacity-20"
          />

          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-300 ease-out',
              indeterminate && 'animate-[spin_1s_linear_infinite]'
            )}
          />
        </svg>

        {/* Center Label */}
        {(showLabel || label !== undefined) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-zinc-text">
              {label !== undefined ? label : Math.round(percentage) + '%'}
            </span>
          </div>
        )}
      </div>
    );
  }
);

AmberCircularProgress.displayName = 'AmberCircularProgress';

// --- Progress Steps ---

export interface ProgressStep {
  label: string;
  value: number;
  description?: string;
}

export interface AmberProgressStepsProps {
  steps: ProgressStep[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * AmberProgressSteps - Step-by-step progress indicator
 *
 * @example
 * <AmberProgressSteps
 *   steps={[
 *     { label: 'Step 1', value: 0 },
 *     { label: 'Step 2', value: 1 },
 *     { label: 'Step 3', value: 2 },
 *     { label: 'Complete', value: 3 }
 *   ]}
 *   currentStep={1}
 * />
 */
export const AmberProgressSteps = React.forwardRef<
  HTMLDivElement,
  AmberProgressStepsProps
>(({ steps, currentStep, orientation = 'horizontal', className }, ref) => {
  const isVertical = orientation === 'vertical';

  return (
    <div
      ref={ref}
      className={cn('flex', isVertical ? 'flex-col gap-0' : 'flex-row items-center gap-2', className)}
    >
      {steps.map((step, index) => {
        const isCompleted = step.value < currentStep;
        const isCurrent = step.value === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.value}>
            {/* Step Item */}
            <div className={cn('flex items-center', isVertical ? 'flex-row gap-4' : 'flex-col gap-2')}>
              {/* Circle Indicator */}
              <div
                className={cn(
                  'relative flex items-center justify-center',
                  'w-10 h-10 rounded-full border-2 font-bold text-sm',
                  'transition-colors duration-200',
                  isCompleted
                    ? 'bg-brand border-brand text-obsidian-outer'
                    : isCurrent
                      ? 'bg-brand/20 border-brand text-brand'
                      : 'bg-obsidian-card border-white/10 text-zinc-muted'
                )}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <div className={cn(isVertical ? 'flex-1' : 'text-center')}>
                <p
                  className={cn(
                    'text-xs font-bold uppercase tracking-widest',
                    isCompleted || isCurrent ? 'text-zinc-text' : 'text-zinc-muted'
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-[10px] text-zinc-muted mt-0.5">{step.description}</p>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  'flex-1 h-0.5',
                  isVertical ? 'w-0.5 h-8 ml-5 mt-2' : 'h-0.5 w-full',
                  isCompleted ? 'bg-brand' : 'bg-white/10',
                  isCurrent && 'bg-brand/50'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
});

AmberProgressSteps.displayName = 'AmberProgressSteps';

export default AmberProgress;
