import React, { useCallback, useMemo, useState } from 'react';
import { AmberInput } from '@core/components/AmberInput';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { cn } from '@core/lib/utils/cn';

export type IqdDenomination = 'unit' | 'thousand' | 'million';

export interface IqdPriceInputProps {
  /** Field label */
  label?: string;
  /** Real IQD value (e.g. 1000000 = 1 million) */
  value: number;
  /** Called with the real IQD amount whenever it changes */
  onChange: (realValue: number) => void;
  /** Starting denomination. Defaults to auto-detection from value magnitude. */
  denomination?: IqdDenomination;
  /** Quick-preset amounts in real IQD. Rendered as pill buttons above the input. */
  presets?: number[];
  /** Minimum real IQD value */
  min?: number;
  /** Maximum real IQD value */
  max?: number;
  error?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
  placeholder?: string;
}

const DENOM_MULTIPLIERS: Record<IqdDenomination, number> = {
  unit: 1,
  thousand: 1_000,
  million: 1_000_000,
};

const DENOM_LABELS: Record<IqdDenomination, { en: string; ar: string }> = {
  unit: { en: 'IQD', ar: 'د.ع' },
  thousand: { en: 'K', ar: 'ألف' },
  million: { en: 'M', ar: 'مليون' },
};

function detectDenomination(value: number): IqdDenomination {
  if (value >= 1_000_000) return 'million';
  if (value >= 1_000) return 'thousand';
  return 'unit';
}

function formatPresetLabel(realValue: number, lang: string): string {
  if (realValue >= 1_000_000) {
    const m = realValue / 1_000_000;
    const formatted = Number.isInteger(m) ? m.toString() : m.toFixed(1);
    return lang === 'ar' ? `${formatted} مليون` : `${formatted}M`;
  }
  if (realValue >= 1_000) {
    const k = realValue / 1_000;
    const formatted = Number.isInteger(k) ? k.toString() : k.toFixed(1);
    return lang === 'ar' ? `${formatted} ألف` : `${formatted}K`;
  }
  return realValue.toLocaleString();
}

export const IqdPriceInput: React.FC<IqdPriceInputProps> = ({
  label,
  value,
  onChange,
  denomination: denominationProp,
  presets,
  min,
  max,
  error,
  disabled,
  icon,
  rightElement,
  className,
  placeholder,
}) => {
  const [activeDenom, setActiveDenom] = useState<IqdDenomination>(
    denominationProp ?? detectDenomination(value || 0),
  );

  const multiplier = DENOM_MULTIPLIERS[activeDenom];

  const displayValue = useMemo(() => {
    if (!value && value !== 0) return '';
    const result = value / multiplier;
    return Number.isInteger(result) ? result.toString() : result.toFixed(3).replace(/\.?0+$/, '');
  }, [value, multiplier]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '' || raw === '-') {
        onChange(0);
        return;
      }
      const parsed = parseFloat(raw);
      if (isNaN(parsed)) return;
      let realValue = Math.round(parsed * multiplier);
      if (min !== undefined && realValue < min) realValue = min;
      if (max !== undefined && realValue > max) realValue = max;
      onChange(realValue);
    },
    [multiplier, min, max, onChange],
  );

  const handlePresetClick = useCallback(
    (presetRealValue: number) => {
      const newDenom = detectDenomination(presetRealValue);
      setActiveDenom(newDenom);
      onChange(presetRealValue);
    },
    [onChange],
  );

  const handleDenomChange = useCallback((newDenom: IqdDenomination) => {
    setActiveDenom(newDenom);
  }, []);

  const lang = typeof window !== 'undefined'
    ? (document.documentElement.lang || 'en')
    : 'en';

  const previewText = value > 0 ? formatCurrency(value) : '';

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-[11px] font-semibold text-zinc-muted tracking-widest">
          {label}
        </label>
      )}

      {/* Denomination toggle */}
      <div className="flex items-center gap-1">
        {(['unit', 'thousand', 'million'] as IqdDenomination[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleDenomChange(d)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all',
              activeDenom === d
                ? 'bg-brand/15 text-brand border border-brand/20'
                : 'bg-white/[0.03] text-zinc-muted border border-white/5 hover:bg-white/[0.06]',
            )}
          >
            {DENOM_LABELS[d][lang === 'ar' ? 'ar' : 'en']}
          </button>
        ))}
      </div>

      {/* Preset buttons */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetClick(preset)}
              disabled={disabled}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all',
                'bg-white/[0.03] border border-white/5 text-zinc-muted',
                'hover:bg-brand/10 hover:text-brand hover:border-brand/20',
                'active:scale-95',
                disabled && 'opacity-40 cursor-not-allowed',
                value === preset && 'bg-brand/15 text-brand border-brand/20',
              )}
            >
              {formatPresetLabel(preset, lang)}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <AmberInput
        type="number"
        value={displayValue || ''}
        onChange={handleInputChange}
        disabled={disabled}
        error={error}
        icon={icon}
        rightElement={rightElement}
        placeholder={placeholder}
      />

      {/* Live preview */}
      {previewText && (
        <p className="text-[11px] font-bold text-zinc-muted tabular-nums">
          = {previewText}
        </p>
      )}
    </div>
  );
};

export default IqdPriceInput;
