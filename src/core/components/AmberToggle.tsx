import { cn } from '@core/lib/utils/cn';

export interface AmberToggleProps {
  enabled: boolean;
  onToggle?: () => void;
  onChange?: (enabled: boolean) => void;
  className?: string;
  size?: 'sm' | 'md';
  activeColor?: string;
  inactiveColor?: string;
  'aria-label'?: string;
  label?: string;
}

/**
 * RTL-safe switch toggle. Thumb position uses logical `start-*` inset
 * instead of physical `translate-x` so Arabic/RTL layouts stay correct.
 */
export function AmberToggle({
  enabled,
  onToggle,
  onChange,
  className,
  size = 'md',
  activeColor = 'bg-brand',
  inactiveColor = 'bg-zinc-600',
  'aria-label': ariaLabel,
  label,
}: AmberToggleProps) {
  const handleClick = () => {
    if (onToggle) {
      onToggle();
      return;
    }
    onChange?.(!enabled);
  };

  const isSm = size === 'sm';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel ?? label}
      onClick={handleClick}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full transition-colors',
        isSm ? 'h-5 w-10' : 'h-6 w-11',
        enabled ? activeColor : inactiveColor,
        className
      )}
    >
      <span
        className={cn(
          'absolute rounded-full bg-white shadow-sm transition-[inset-inline-start] duration-200',
          isSm ? 'top-0.5 h-3.5 w-3.5' : 'top-1 h-4 w-4',
          enabled ? (isSm ? 'start-5' : 'start-6') : 'start-1'
        )}
      />
    </button>
  );
}
