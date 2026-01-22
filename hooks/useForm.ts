
import { useState, useCallback } from 'react';

export type Validator<T> = (values: T) => Partial<Record<keyof T, string>>;

export function useForm<T>(initialValues: T, validator: Validator<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((key: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [key]: value }));
    // Clear error when user types/changes value
    setErrors(prev => {
        if (!prev[key]) return prev;
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
    });
  }, []);

  const handleSubmit = useCallback((onSubmit: (values: T) => void) => {
    setIsSubmitting(true);
    const validationErrors = validator(values);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return false; // Validation failed
    }

    onSubmit(values);
    setIsSubmitting(false);
    return true; // Validation passed
  }, [values, validator]);

  const setFieldValue = useCallback((key: keyof T, value: any) => {
      handleChange(key, value);
  }, [handleChange]);

  return { values, errors, handleChange, setFieldValue, handleSubmit, isSubmitting };
}
