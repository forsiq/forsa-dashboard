import { useLanguage } from '@core/contexts/LanguageContext';

interface AmberToggleProps {
  enabled: boolean;
  onToggle: () => void;
  className?: string;
  size?: 'sm' | 'md';
  activeColor?: string;
  inactiveColor?: string;
}

export const AmberToggle = ({
  enabled,
  onToggle,
  className = '',
  size = 'md',
  activeColor = 'bg-emerald-500',
  inactiveColor = 'bg-zinc-600',
}: AmberToggleProps) => {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  // Size variants
  const sizeClasses = size === 'sm' 
    ? 'w-10 h-5' 
    : 'w-12 h-6';
  const knobSize = size === 'sm' 
    ? 'w-4 h-4' 
    : 'w-5 h-5';

  // RTL-aware translation
  const enabledTranslate = isRTL ? '-translate-x-6' : 'translate-x-6';
  const disabledTranslate = isRTL ? '-translate-x-0.5' : 'translate-x-0.5';

  const bgClass = enabled ? activeColor : inactiveColor;
  const translateClass = enabled ? enabledTranslate : disabledTranslate;

  return (
    <button
      onClick={onToggle}
      className={`rounded-full transition-colors ${sizeClasses} ${bgClass} ${className}`}
      type="button"
      role="switch"
      aria-checked={enabled}
    >
      <div
        className={`rounded-full bg-white shadow transform transition-transform ${knobSize} ${translateClass}`}
      />
    </button>
  );
};
