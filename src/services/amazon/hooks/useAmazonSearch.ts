import { useQuery } from '@tanstack/react-query';
import { amazonApi } from '../api/amazon-api';

const amazonKeys = {
  search: (query: string, domain?: string) =>
    ['amazon', 'search', query, domain] as const,
  detail: (asin: string, domain?: string) =>
    ['amazon', 'detail', asin, domain] as const,
  bestsellers: (category?: string, domain?: string) =>
    ['amazon', 'bestsellers', category, domain] as const,
};

export function useAmazonSearch(
  query: string,
  options?: { limit?: number; domain?: string; enabled?: boolean }
) {
  return useQuery({
    queryKey: amazonKeys.search(query, options?.domain),
    queryFn: () =>
      amazonApi.searchProducts(query, {
        limit: options?.limit,
        domain: options?.domain,
      }),
    enabled: !!query.trim() && (options?.enabled !== false),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAmazonProduct(
  asin: string,
  options?: { domain?: string; enabled?: boolean }
) {
  return useQuery({
    queryKey: amazonKeys.detail(asin, options?.domain),
    queryFn: () =>
      amazonApi.getProductDetails(asin, { domain: options?.domain }),
    enabled: !!asin && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAmazonBestSellers(
  options?: { category?: string; limit?: number; domain?: string; enabled?: boolean }
) {
  return useQuery({
    queryKey: amazonKeys.bestsellers(options?.category, options?.domain),
    queryFn: () =>
      amazonApi.getBestSellers({
        category: options?.category,
        limit: options?.limit,
        domain: options?.domain,
      }),
    enabled: options?.enabled !== false,
    staleTime: 10 * 60 * 1000,
  });
}

export { amazonKeys };
