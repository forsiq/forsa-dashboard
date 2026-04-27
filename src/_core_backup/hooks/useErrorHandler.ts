import { useRef, useEffect } from 'react';
import { useToast } from '@core/contexts/ToastContext';

/**
 * Hook to show error toast only once per unique error.
 * Prevents duplicate toast notifications for the same error.
 */
export function useErrorHandler(error: unknown, messagePrefix: string) {
  const { error: toastError } = useToast();
  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (error) {
      const errorMsg = (error as any)?.message || (error as any)?.error || 'Unknown error';
      const errorKey = `${messagePrefix}:${errorMsg}`;
      if (lastErrorRef.current !== errorKey) {
        lastErrorRef.current = errorKey;
        toastError(`${messagePrefix}: ${errorMsg}`, 8000);
      }
    } else {
      lastErrorRef.current = null;
    }
  }, [error, messagePrefix, toastError]);
}
