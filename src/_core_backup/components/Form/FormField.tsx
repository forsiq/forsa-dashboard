/**
 * FormField Components
 * Individual field renderers for FormBuilder
 */

import React from 'react';
import { Eye, EyeOff, Upload } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';
import { AmberInput } from '../AmberInput';
import { AmberButton } from '../AmberButton';
import type { FormFieldProps, FormFieldConfig } from './types';

// ============================================================================
// Text Input Field
// ============================================================================

export function TextField({
  label,
  name,
  value,
  placeholder,
  required,
  disabled,
  error,
  onChange,
  className,
}: FormFieldProps) {
  const { dir } = useLanguage();

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className={cn(
          'text-xs font-bold text-zinc-muted uppercase tracking-wider',
          error && 'text-danger'
        )}>
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <AmberInput
        name={name}
        value={String(value || '')}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
      />
      {error && (
        <p className="text-xs text-danger font-medium">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// Textarea Field
// ============================================================================

export function TextareaField({
  label,
  name,
  value,
  placeholder,
  required,
  disabled,
  error,
  onChange,
  className,
}: FormFieldProps) {
  const { dir } = useLanguage();

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className={cn(
          'text-xs font-bold text-zinc-muted uppercase tracking-wider',
          error && 'text-danger'
        )}>
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={String(value || '')}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        className={cn(
          'w-full min-h-[100px] px-4 py-3 rounded-xl border',
          'bg-[var(--color-obsidian-card)] text-zinc-text',
          'border-[var(--color-border)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'placeholder:text-zinc-muted/50',
          error && 'border-danger focus:ring-danger/20',
          'transition-all'
        )}
      />
      {error && (
        <p className="text-xs text-danger font-medium">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// Number Field
// ============================================================================

export function NumberField({
  label,
  name,
  value,
  placeholder,
  required,
  disabled,
  error,
  validation,
  onChange,
  className,
}: FormFieldProps) {
  const { dir } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Handle min/max constraints
    if (validation?.min !== undefined) {
      const numValue = parseFloat(newValue);
      if (!isNaN(numValue) && numValue < validation.min) {
        newValue = String(validation.min);
      }
    }
    if (validation?.max !== undefined) {
      const numValue = parseFloat(newValue);
      if (!isNaN(numValue) && numValue > validation.max) {
        newValue = String(validation.max);
      }
    }

    onChange(newValue ? parseFloat(newValue) : '');
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className={cn(
          'text-xs font-bold text-zinc-muted uppercase tracking-wider',
          error && 'text-danger'
        )}>
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <input
        type="number"
        name={name}
        value={value as number ?? ''}
        placeholder={placeholder}
        disabled={disabled}
        min={validation?.min}
        max={validation?.max}
        onChange={handleChange}
        dir={dir}
        className={cn(
          'w-full px-4 py-3 rounded-xl border',
          'bg-[var(--color-obsidian-card)] text-zinc-text',
          'border-[var(--color-border)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'placeholder:text-zinc-muted/50',
          error && 'border-danger focus:ring-danger/20',
          'transition-all'
        )}
      />
      {error && (
        <p className="text-xs text-danger font-medium">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// Select Field
// ============================================================================

export function SelectField({
  label,
  name,
  value,
  placeholder,
  required,
  disabled,
  error,
  options = [],
  onChange,
  className,
}: FormFieldProps & { options?: Array<{ label: string; value: string }> }) {
  const { t, dir } = useLanguage();

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className={cn(
          'text-xs font-bold text-zinc-muted uppercase tracking-wider',
          error && 'text-danger'
        )}>
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <select
        name={name}
        value={String(value ?? '')}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        className={cn(
          'w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer',
          'bg-[var(--color-obsidian-card)] text-zinc-text',
          'border-[var(--color-border)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-danger focus:ring-danger/20',
          'transition-all',
          'pr-10' // space for dropdown arrow
        )}
      >
        <option value="">{placeholder || t('common.select') || 'Select...'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-danger font-medium">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// Checkbox Field
// ============================================================================

export function CheckboxField({
  label,
  name,
  value,
  disabled,
  error,
  onChange,
  className,
}: FormFieldProps) {
  const { dir } = useLanguage();

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <input
        type="checkbox"
        name={name}
        checked={Boolean(value)}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={cn(
          'w-5 h-5 rounded border-2 cursor-pointer',
          'accent-[var(--color-brand)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-danger'
        )}
      />
      {label && (
        <label className={cn(
          'text-sm font-medium text-zinc-text cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'text-danger'
        )}>
          {label}
        </label>
      )}
    </div>
  );
}

// ============================================================================
// Radio Field Group
// ============================================================================

export function RadioField({
  label,
  name,
  value,
  disabled,
  error,
  options = [],
  onChange,
  className,
}: FormFieldProps & { options?: Array<{ label: string; value: string }> }) {
  const { dir } = useLanguage();

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className={cn(
          'text-xs font-bold text-zinc-muted uppercase tracking-wider',
          error && 'text-danger'
        )}>
          {label}
        </label>
      )}
      <div className="space-y-2" dir={dir}>
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              disabled={disabled}
              onChange={() => onChange(option.value)}
              className={cn(
                'w-4 h-4 accent-[var(--color-brand)] cursor-pointer',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
            <span className={cn(
              'text-sm text-zinc-text group-hover:text-zinc-secondary',
              disabled && 'opacity-50'
            )}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-xs text-danger font-medium">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// Date Field
// ============================================================================

export function DateField({
  label,
  name,
  value,
  placeholder,
  required,
  disabled,
  error,
  onChange,
  className,
}: FormFieldProps) {
  const { dir } = useLanguage();

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateValue: unknown): string => {
    if (!dateValue) return '';
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0];
    }
    if (typeof dateValue === 'string') {
      return dateValue.split('T')[0];
    }
    return '';
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className={cn(
          'text-xs font-bold text-zinc-muted uppercase tracking-wider',
          error && 'text-danger'
        )}>
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <input
        type="date"
        name={name}
        value={formatDateForInput(value)}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value || null)}
        dir={dir}
        className={cn(
          'w-full px-4 py-3 rounded-xl border',
          'bg-[var(--color-obsidian-card)] text-zinc-text',
          'border-[var(--color-border)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-danger focus:ring-danger/20',
          'transition-all',
          'calendar-picker-icon' // for Webkit browsers
        )}
      />
      {error && (
        <p className="text-xs text-danger font-medium">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// File Upload Field
// ============================================================================

export function FileField({
  label,
  name,
  value,
  required,
  disabled,
  error,
  onChange,
  className,
}: FormFieldProps) {
  const { t } = useLanguage();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className={cn(
          'text-xs font-bold text-zinc-muted uppercase tracking-wider',
          error && 'text-danger'
        )}>
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <input
        ref={fileInputRef}
        type="file"
        name={name}
        disabled={disabled}
        onChange={handleFileChange}
        className="hidden"
      />
      <AmberButton
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-12 border-dashed"
      >
        <Upload className="w-5 h-5 mr-2" />
        <span>{value ? (value as File).name : (t('common.choose_file') || 'Choose file...')}</span>
      </AmberButton>
      {error && (
        <p className="text-xs text-danger font-medium">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// Field Type Renderer
// ============================================================================

export function FormField(props: FormFieldProps & { options?: Array<{ label: string; value: string }> }) {
  const { type = 'text' } = props;

  const fieldProps = {
    ...props,
    type: undefined as any, // Remove type from props
  };

  switch (type) {
    case 'text':
    case 'email':
      return <TextField {...fieldProps} type={type} />;
    case 'textarea':
      return <TextareaField {...fieldProps} />;
    case 'number':
      return <NumberField {...fieldProps} />;
    case 'select':
      return <SelectField {...fieldProps} />;
    case 'checkbox':
      return <CheckboxField {...fieldProps} />;
    case 'radio':
      return <RadioField {...fieldProps} />;
    case 'date':
      return <DateField {...fieldProps} />;
    case 'file':
    case 'image':
      return <FileField {...fieldProps} />;
    default:
      return <TextField {...fieldProps} />;
  }
}
