/**
 * FormBuilder Component
 *
 * A dynamic form builder that generates forms from configuration.
 * Supports validation, multiple layouts, and action buttons.
 *
 * @example
 * <FormBuilder
 *   fields={formFields}
 *   initialValues={initialData}
 *   onSubmit={handleSubmit}
 *   isLoading={isSubmitting}
 *   actions={['save', 'cancel']}
 * />
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Loader2, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';
import { AmberButton } from '../AmberButton';
import { FormField } from './FormField';
import type { FormBuilderProps, FormAction, FormState } from './types';

// ============================================================================
// Default Actions
// ============================================================================

const defaultActions: FormAction[] = [
  {
    type: 'submit',
    label: 'common.save' as string,
    variant: 'primary',
  },
  {
    type: 'button',
    label: 'common.cancel' as string,
    variant: 'ghost',
  },
];

// ============================================================================
// Main FormBuilder Component
// ============================================================================

export function FormBuilder<T extends Record<string, unknown>>({
  fields,
  initialValues,
  onSubmit,
  isLoading = false,
  actions,
  showActions = true,
  submitLabel,
  cancelLabel,
  layout = 'vertical',
  columns = 1,
  fieldClassName,
  onCancel,
  onChange,
  className,
  containerClassName,
}: FormBuilderProps<T>) {
  const { t } = useLanguage();

  // Form state
  const [values, setValues] = useState<T>(initialValues || ({} as T));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Derive form state
  const isDirty = Object.keys(touched).length > 0;
  const isValid = Object.keys(errors).length === 0;

  // Update values when initialValues change
  React.useEffect(() => {
    if (initialValues) {
      setValues(initialValues);
    }
  }, [initialValues]);

  // Compute actions
  const computedActions = useMemo(() => {
    if (actions) return actions;

    const result: FormAction[] = [];
    result.push({
      type: 'submit',
      label: submitLabel || (t('common.save') || 'Save'),
      variant: 'primary',
      disabled: !isDirty || !isValid,
      loading: isLoading,
    });

    if (onCancel) {
      result.push({
        type: 'button',
        label: cancelLabel || (t('common.cancel') || 'Cancel'),
        variant: 'ghost',
        onClick: onCancel,
      });
    }

    return result;
  }, [actions, submitLabel, cancelLabel, onCancel, t, isDirty, isValid, isLoading]);

  // Validate a single field
  const validateField = useCallback((field: typeof fields[0], fieldValue: unknown): string | undefined => {
    if (field.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
      return field.label
        ? `${field.label} ${t('common.is_required') || 'is required'}`
        : t('common.required') || 'This field is required';
    }

    if (field.validation) {
      const { min, max, pattern, custom } = field.validation;

      // String length validation
      if (typeof fieldValue === 'string') {
        if (min !== undefined && fieldValue.length < min) {
          return `${field.label} ${t('common.min_length') || 'minimum length'}: ${min}`;
        }
        if (max !== undefined && fieldValue.length > max) {
          return `${field.label} ${t('common.max_length') || 'maximum length'}: ${max}`;
        }
      }

      // Number range validation
      if (typeof fieldValue === 'number') {
        if (min !== undefined && fieldValue < min) {
          return `${field.label} ${t('common.min_value') || 'minimum value'}: ${min}`;
        }
        if (max !== undefined && fieldValue > max) {
          return `${field.label} ${t('common.max_value') || 'maximum value'}: ${max}`;
        }
      }

      // Pattern validation
      if (pattern && typeof fieldValue === 'string') {
        const regex = new RegExp(pattern);
        if (!regex.test(fieldValue)) {
          return `${field.label} ${t('common.invalid_format') || 'invalid format'}`;
        }
      }

      // Custom validation
      if (custom) {
        return custom(fieldValue);
      }
    }

    return undefined;
  }, [t]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.hidden) return;

      const error = validateField(field, values[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, values, validateField]);

  // Handle value change
  const handleChange = useCallback((fieldName: string, newValue: unknown) => {
    setValues((prev) => {
      const updated = { ...prev, [fieldName]: newValue };

      // Trigger validation if field has been touched
      if (touched[fieldName]) {
        const field = fields.find((f) => f.name === fieldName);
        if (field) {
          const error = validateField(field, newValue);
          setErrors((prev) => {
            const newErrors = { ...prev };
            if (error) {
              newErrors[fieldName] = error;
            } else {
              delete newErrors[fieldName];
            }
            return newErrors;
          });
        }
      }

      // Call onChange callback
      if (onChange) {
        onChange(updated, fieldName, newValue);
      }

      return updated;
    });
  }, [touched, fields, validateField, onChange]);

  // Handle field blur (mark as touched)
  const handleBlur = useCallback((fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    // Validate on blur
    const field = fields.find((f) => f.name === fieldName);
    if (field) {
      const error = validateField(field, values[field.name]);
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }
        return newErrors;
      });
    }
  }, [fields, values, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    fields.forEach((field) => {
      if (!field.hidden) {
        allTouched[field.name] = true;
      }
    });
    setTouched(allTouched);

    // Validate all fields
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    await onSubmit(values);
  }, [fields, validateForm, onSubmit, values]);

  // Grid columns class
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    12: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
  }[columns] || 'grid-cols-1';

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
    >
      {/* Form Fields */}
      <div className={cn(
        layout === 'grid' && 'grid gap-4',
        layout === 'grid' && gridColsClass,
        layout === 'horizontal' && 'space-y-4',
        layout === 'vertical' && 'space-y-4',
        containerClassName
      )}>
        {fields.map((field) => {
          if (field.hidden) return null;

          const fieldError = touched[field.name] ? errors[field.name] : undefined;

          return (
            <div
              key={field.name}
              className={cn(
                fieldClassName,
                field.grid && layout === 'vertical' && gridColsClass.split(' ')[0]
              )}
            >
              <FormField
                {...field}
                value={values[field.name]}
                error={fieldError}
                onChange={(newValue) => handleChange(field.name, newValue)}
                onBlur={() => handleBlur(field.name)}
                disabled={field.disabled || isLoading}
              />
            </div>
          );
        })}
      </div>

      {/* Form Actions */}
      {showActions && computedActions.length > 0 && (
        <div className={cn(
          'flex items-center gap-3 pt-4 border-t border-[var(--color-border)]',
          layout === 'horizontal' && 'border-none pt-0'
        )}>
          {computedActions.map((action, index) => {
            if (action.type === 'submit') {
              return (
                <AmberButton
                  key={index}
                  type="submit"
                  variant={action.variant === 'primary' ? 'primary' : 'secondary'}
                  disabled={action.disabled || isLoading}
                  className={cn('gap-2', action.className)}
                >
                  {action.loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {action.icon && <action.icon className="w-4 h-4" />}
                  {action.label}
                </AmberButton>
              );
            }

            return (
              <AmberButton
                key={index}
                type="button"
                variant={action.variant === 'danger' ? 'outline' : 'ghost'}
                className={cn(
                  action.variant === 'danger' && 'text-danger border-danger hover:bg-danger/5',
                  'gap-2',
                  action.className
                )}
                disabled={action.disabled}
                onClick={action.onClick}
              >
                {action.icon && <action.icon className="w-4 h-4" />}
                {action.label}
              </AmberButton>
            );
          })}
        </div>
      )}

      {/* Global Error Display */}
      {Object.keys(errors).length > 0 && touched[Object.keys(errors)[0]] && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl">
          <p className="text-sm text-danger font-medium">
            {t('common.fix_errors') || 'Please fix the errors above before submitting.'}
          </p>
        </div>
      )}
    </form>
  );
}

// ============================================================================
// Export Default
// ============================================================================

export default FormBuilder;
