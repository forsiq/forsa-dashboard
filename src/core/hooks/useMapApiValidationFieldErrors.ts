import { useCallback } from 'react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { mapApiValidationToFieldMap } from '../utils/mapApiValidationError';

/** Maps API validation errors to `{ fieldName: localizedMessage }` for inline form errors. */
export function useMapApiValidationFieldErrors() {
  const { t, language } = useLanguage();
  return useCallback(
    (error: unknown) => mapApiValidationToFieldMap(error, t, language),
    [t, language],
  );
}
