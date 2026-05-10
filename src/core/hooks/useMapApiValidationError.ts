import { useCallback } from 'react';
import { useLanguage } from '@core/contexts/LanguageContext';
import {
  mapApiValidationToUserMessage,
  type FormatApiValidationOptions,
} from '../utils/mapApiValidationError';

/**
 * Maps NestJS/class-validator style `message` values through app translations.
 */
export function useMapApiValidationError() {
  const { t, language } = useLanguage();
  return useCallback(
    (error: unknown, options?: FormatApiValidationOptions) =>
      mapApiValidationToUserMessage(error, t, language, options),
    [t, language],
  );
}
