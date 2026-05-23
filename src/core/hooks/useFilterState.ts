import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

function parseUrlValue(raw: string | string[] | undefined, defaultValue: string | number | boolean): string | number | boolean {
  if (raw == null) return defaultValue;
  const str = Array.isArray(raw) ? raw[0] : raw;

  if (typeof defaultValue === 'number') {
    const parsed = Number(str);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  }
  if (typeof defaultValue === 'boolean') {
    return str === 'true' ? true : str === 'false' ? false : defaultValue;
  }
  return str;
}

function serializeValue(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  return String(value);
}

/**
 * Drop-in replacement for useState that persists the value in URL query params.
 *
 * - Reads initial value from `router.query[key]` on mount
 * - Writes changes back via `router.replace` with `shallow: true`
 * - Omits params that match the default value (keeps URLs clean)
 *
 * @example
 * const [search, setSearch] = useFilterState('search', '');
 * const [page, setPage] = useFilterState('page', 1);
 */
export function useFilterState<T extends string | number | boolean>(
  key: string,
  defaultValue: T,
): [T, (val: string | number | boolean | ((prev: T) => string | number | boolean)) => void] {
  const router = useRouter();
  const isReady = router.isReady;

  const initialised = useRef(false);
  const [value, setValue] = useState<string | number | boolean>(() => {
    if (!isReady) return defaultValue;
    return parseUrlValue(router.query[key], defaultValue);
  }) as [T, React.Dispatch<React.SetStateAction<string | number | boolean>>];

  useEffect(() => {
    if (!isReady || initialised.current) return;
    initialised.current = true;
    const urlValue = parseUrlValue(router.query[key], defaultValue);
    if (urlValue !== defaultValue) {
      setValue(urlValue);
    }
  }, [isReady, key, defaultValue, router.query]);

  const setFilter = useCallback(
    (arg: string | number | boolean | ((prev: T) => string | number | boolean)) => {
      setValue((prev) => {
        const next = typeof arg === 'function' ? (arg as (p: T) => string | number | boolean)(prev as T) : arg;

        const query = { ...router.query };
        const serialized = serializeValue(next);
        const defaultSerialized = serializeValue(defaultValue);

        if (serialized === defaultSerialized || serialized === undefined) {
          delete query[key];
        } else {
          query[key] = serialized;
        }

        router.replace({ pathname: router.pathname, query }, undefined, { shallow: true }).catch(() => {});

        return next;
      });
    },
    [key, defaultValue, router],
  );

  return [value as T, setFilter];
}
