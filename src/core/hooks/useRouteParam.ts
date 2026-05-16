import { useRouter } from 'next/router';
import { isSafePathResourceId } from '@core/utils/safeRouteId';

interface UseRouteParamOptions {
  parse?: 'number' | 'string';
}

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
export function useRouteParam(
  key: string,
  options: UseRouteParamOptions = { parse: 'string' },
): string | number | undefined {
  const router = useRouter();

  if (!router.isReady) return undefined;

  const raw = router.query[key];
  if (raw == null) return undefined;

  const str = Array.isArray(raw) ? raw[0] : String(raw);

  if (options.parse === 'number') {
    const parsed = Number(str);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return isSafePathResourceId(str) ? str : undefined;
}
