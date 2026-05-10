import { useCallback, useEffect, useMemo, useState } from 'react';

export type ColumnWithKey = { key: string };

/**
 * Reorders table columns and persists key order in localStorage.
 */
export function usePersistedColumnOrder<T extends ColumnWithKey>(
  columns: T[],
  storageKey: string,
): {
  orderedColumns: T[];
  moveColumn: (key: string, delta: -1 | 1) => void;
  selectedKey: string;
  setSelectedKey: (key: string) => void;
} {
  const defaultKeyStr = columns.map((c) => c.key).join('\0');

  const [order, setOrder] = useState<string[]>(() => columns.map((c) => c.key));
  const [selectedKey, setSelectedKey] = useState<string>(columns[0]?.key ?? '');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const keys = columns.map((c) => c.key);
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        const valid = parsed.filter((k) => keys.includes(k));
        const missing = keys.filter((k) => !valid.includes(k));
        setOrder([...valid, ...missing]);
      } else {
        setOrder(keys);
      }
    } catch {
      setOrder(keys);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-merge when column keys or storage key change
  }, [storageKey, defaultKeyStr]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(order));
    } catch {
      /* ignore quota / private mode */
    }
  }, [hydrated, order, storageKey]);

  useEffect(() => {
    setSelectedKey((prev) => (order.includes(prev) ? prev : order[0] ?? ''));
  }, [order]);

  const orderedColumns = useMemo(() => {
    const byKey = new Map(columns.map((c) => [c.key, c] as const));
    return order.map((k) => byKey.get(k)).filter((c): c is T => Boolean(c));
  }, [columns, order]);

  const moveColumn = useCallback((key: string, delta: -1 | 1) => {
    setOrder((prev) => {
      const i = prev.indexOf(key);
      if (i < 0) return prev;
      const j = i + delta;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[i];
      next[i] = next[j];
      next[j] = tmp;
      return next;
    });
  }, []);

  return { orderedColumns, moveColumn, selectedKey, setSelectedKey };
}
