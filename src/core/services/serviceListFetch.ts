import type { AxiosInstance } from 'axios';

/**
 * Build query string the same way as createApiClient().list() in core-ui.
 */
export function appendListFilters(
  params: URLSearchParams,
  filters?: Record<string, unknown>,
): void {
  if (!filters) return;
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
}

/**
 * GET collection with optional AbortSignal so TanStack Query cancelQueries can abort in-flight list fetches.
 */
export function getWithListFilters(
  client: AxiosInstance,
  listPath: string,
  filters?: Record<string, unknown>,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams();
  appendListFilters(params, filters);
  const queryString = params.toString();
  const url = queryString ? `${listPath}?${queryString}` : listPath;
  return client.get(url, { signal });
}

export interface ParsedListResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Normalize auction-service list payloads:
 * - `{ data: T[] }` (auctions, orders)
 * - `{ data: { items: T[], total, ... } }` (merchants)
 * - `{ items: T[] }` at root
 */
export function parseApiListBody<T>(
  body: unknown,
  defaults?: { page?: number; limit?: number },
): ParsedListResult<T> {
  const page = defaults?.page ?? 1;
  const limit = defaults?.limit ?? 20;

  const empty = (): ParsedListResult<T> => ({
    items: [],
    total: 0,
    page,
    limit,
    totalPages: 1,
  });

  if (!body || typeof body !== 'object') return empty();

  const fromPaginatedObject = (obj: Record<string, unknown>): ParsedListResult<T> | null => {
    const rawItems = obj.items ?? obj.results;
    if (!Array.isArray(rawItems)) return null;
    const items = rawItems as T[];
    const total = Number(obj.total ?? items.length);
    const lim = Number(obj.limit ?? limit);
    const pg = Number(obj.page ?? page);
    const totalPages = Number(obj.totalPages ?? Math.max(1, Math.ceil(total / lim)));
    return { items, total, page: pg, limit: lim, totalPages };
  };

  const b = body as Record<string, unknown>;

  if (Array.isArray(b.data)) {
    const items = b.data as T[];
    const pagination = b.pagination as Record<string, unknown> | undefined;
    const total = Number(b.total ?? pagination?.total ?? items.length);
    const lim = Number(b.limit ?? pagination?.limit ?? limit);
    const pg = Number(b.page ?? pagination?.page ?? page);
    const totalPages = Number(
      b.totalPages ?? pagination?.totalPages ?? Math.max(1, Math.ceil(total / lim)),
    );
    return { items, total, page: pg, limit: lim, totalPages };
  }

  if (b.data && typeof b.data === 'object' && !Array.isArray(b.data)) {
    const nested = fromPaginatedObject(b.data as Record<string, unknown>);
    if (nested) return nested;
  }

  const topLevel = fromPaginatedObject(b);
  if (topLevel) return topLevel;

  return empty();
}
