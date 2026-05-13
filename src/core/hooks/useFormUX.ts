import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';

interface UseFormUXOptions {
  /** Current form values */
  values: Record<string, any>;
  /** Initial/default values to compare against */
  initialValues: Record<string, any>;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Key for localStorage auto-save (omit to disable) */
  storageKey?: string;
  /** Key for persisting last-used field values after successful submit (omit to disable) */
  historyKey?: string;
  /** List of field names to persist as "last used" on markClean (only these fields are saved) */
  historyFields?: string[];
  /** Custom warning message */
  warningMessage?: string;
}

interface UseFormUXReturn {
  /** Whether form has unsaved changes */
  isDirty: boolean;
  /** Reset dirty state (call after successful submit) */
  markClean: () => void;
  /** Restore saved draft from localStorage */
  restoreDraft: () => Record<string, any> | null;
  /** Restore last-used values from history (returns only the tracked fields) */
  restoreHistory: () => Record<string, any> | null;
  /** Clear saved draft */
  clearDraft: () => void;
  /** Check if there's a saved draft */
  hasDraft: boolean;
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => deepEqual(a[key], b[key]));
  }

  return false;
}

export function useFormUX({
  values,
  initialValues,
  isSubmitting = false,
  storageKey,
  historyKey,
  historyFields,
  warningMessage,
}: UseFormUXOptions): UseFormUXReturn {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const prevDirtyRef = useRef(false);

  // Check if values differ from initial
  useEffect(() => {
    const dirty = !deepEqual(values, initialValues);
    if (dirty !== prevDirtyRef.current) {
      prevDirtyRef.current = dirty;
      setIsDirty(dirty);
    }
  }, [values, initialValues]);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (storageKey && isDirty) {
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(values));
        } catch {
          // localStorage might be full or unavailable
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [storageKey, isDirty, values]);

  // Browser tab close warning
  useEffect(() => {
    if (!isDirty || isSubmitting) return;

    const message = warningMessage || 'You have unsaved changes. Are you sure you want to leave?';

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isSubmitting, warningMessage]);

  // Next.js route change blocking - beforePopState (browser back/forward)
  useEffect(() => {
    if (!isDirty || isSubmitting) return;

    const message = warningMessage || 'You have unsaved changes. Are you sure you want to leave?';

    router.beforePopState(() => {
      if (prevDirtyRef.current) {
        const confirmLeave = window.confirm(message);
        if (!confirmLeave) {
          return false;
        }
      }
      return true;
    });

    return () => {
      router.beforePopState(() => true);
    };
  }, [isDirty, isSubmitting, router, warningMessage]);

  // Next.js route change blocking - Link clicks (routeChangeStart)
  useEffect(() => {
    if (!isDirty || isSubmitting) return;

    const message = warningMessage || 'You have unsaved changes. Are you sure you want to leave?';

    const handleRouteChangeStart = (url: string) => {
      if (prevDirtyRef.current && url !== router.asPath) {
        if (!window.confirm(message)) {
          router.events.emit('routeChangeError');
          throw 'Abort route change by user';
        }
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    return () => router.events.off('routeChangeStart', handleRouteChangeStart);
  }, [isDirty, isSubmitting, router.asPath, router.events, warningMessage]);

  const markClean = useCallback(() => {
    // Save specified fields to history BEFORE clearing draft
    if (historyKey && historyFields?.length) {
      const historyValues: Record<string, any> = {};
      for (const field of historyFields) {
        if (values[field] !== undefined && values[field] !== null && values[field] !== '') {
          historyValues[field] = values[field];
        }
      }
      try {
        localStorage.setItem(historyKey, JSON.stringify(historyValues));
      } catch {
        // localStorage might be full or unavailable
      }
    }
    // Clear draft
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
    }
    prevDirtyRef.current = false;
    setIsDirty(false);
  }, [historyKey, historyFields, storageKey, values]);

  const restoreDraft = useCallback((): Record<string, any> | null => {
    if (!storageKey) return null;
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    if (!storageKey) return;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  const restoreHistory = useCallback((): Record<string, any> | null => {
    if (!historyKey) return null;
    try {
      const saved = localStorage.getItem(historyKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [historyKey]);

  const hasDraft = useMemo(() => {
    if (!storageKey) return false;
    try {
      return localStorage.getItem(storageKey) !== null;
    } catch {
      return false;
    }
  }, [storageKey]);

  return {
    isDirty,
    markClean,
    restoreDraft,
    restoreHistory,
    clearDraft,
    hasDraft,
  };
}
