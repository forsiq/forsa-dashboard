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
