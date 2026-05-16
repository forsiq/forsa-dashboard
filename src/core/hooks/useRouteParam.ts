import { useRouter } from 'next/router';
import { isSafePathResourceId } from '@core/utils/safeRouteId';

interface UseRouteParamOptions {
  parse?: 'number' | 'string';
}

// Existing overloads (backward compatible)
export function useRouteParam(
  key: string,
  options: { parse: 'number' },
): number | undefined;
export function useRouteParam(
  key: string,
  options: { parse: 'string' },
): string | undefined;
export function useRouteParam(
  key: string,
  options?: UseRouteParamOptions,
): string | number | undefined;

// New safe overloads returning [value, isReady]
export function useRouteParam(
  key: string,
  options: { parse: 'number'; safe: true },
): [number | undefined, boolean];
export function useRouteParam(
  key: string,
  options: { parse: 'string'; safe: true },
): [string | undefined, boolean];

// Implementation
export function useRouteParam(
  key: string,
  options: UseRouteParamOptions & { safe?: boolean } = { parse: 'string' },
): string | number | undefined | [string | number | undefined, boolean] {
  const router = useRouter();
  const ready = router.isReady;

  if (!ready) {
    return options.safe ? [undefined, false] : undefined;
  }

  const raw = router.query[key];
  if (raw == null) {
    return options.safe ? [undefined, true] : undefined;
  }

  const str = Array.isArray(raw) ? raw[0] : String(raw);

  if (options.parse === 'number') {
    const parsed = Number(str);
    const value = Number.isFinite(parsed) ? parsed : undefined;
    return options.safe ? [value, true] : value;
  }

  const value = isSafePathResourceId(str) ? str : undefined;
  return options.safe ? [value, true] : value;
}
