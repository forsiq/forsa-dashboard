import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@core/contexts/ToastContext';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useMapApiValidationError } from './useMapApiValidationError';

export interface MutationContext {
  queryClient: ReturnType<typeof useQueryClient>;
  toast: ReturnType<typeof useToast>;
  t: ReturnType<typeof useLanguage>['t'];
  mapApiError: ReturnType<typeof useMapApiValidationError>;
  getErrorDetail: (error: unknown) => string;
}

export function useMutationContext(): MutationContext {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useLanguage();
  const mapApiError = useMapApiValidationError();

  const getErrorDetail = (error: unknown): string =>
    mapApiError(error) || (error instanceof Error ? error.message : String(error || '')) || t('toast.unknown_error');

  return { queryClient, toast, t, mapApiError, getErrorDetail };
}
