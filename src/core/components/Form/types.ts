/**
 * FormBuilder Types
 */

import type { FormFieldConfig as ServiceFormFieldConfig } from '@core/services/types';

// Re-export FormFieldConfig for convenience
export type FormFieldConfig = ServiceFormFieldConfig;

// ============================================================================
// Form Builder Props
// ============================================================================

export interface FormBuilderProps<T = Record<string, unknown>> {
  // Configuration
  fields: FormFieldConfig[];
  initialValues?: T;

  // Form state
  onSubmit: (data: T) => void | Promise<void>;
  isLoading?: boolean;
  isDirty?: boolean;
  isValid?: boolean;

  // Actions
  actions?: FormAction[];
  showActions?: boolean;
  submitLabel?: string;
  cancelLabel?: string;

  // Layout
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  fieldClassName?: string;

  // Callbacks
  onCancel?: () => void;
  onChange?: (data: T, field: string, value: unknown) => void;
  onFieldError?: (field: string, error: string) => void;

  // Styling
  className?: string;
  containerClassName?: string;
}

export interface FormAction {
  type: 'submit' | 'button' | 'reset';
  label: string;
  icon?: React.ElementType;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

// ============================================================================
// Form Field Props
// ============================================================================

export interface FormFieldProps extends FormFieldConfig {
  value: unknown;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  className?: string;
}

// ============================================================================
// Form State
// ============================================================================

export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

// ============================================================================
// Form Context
// ============================================================================

export interface FormContextValue<T = Record<string, unknown>> {
  state: FormState<T>;
  setValue: (field: keyof T, value: unknown) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  reset: () => void;
  handleSubmit: (onSubmit: (data: T) => void | Promise<void>) => (e?: React.FormEvent) => Promise<void>;
}
