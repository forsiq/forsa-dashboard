import { useQuery } from '@tanstack/react-query';
import { listingApi } from '../api/listing-api';
import { listingKeys } from '../api/listing-hooks';

export function useBrands() {
  return useQuery({
    queryKey: [...listingKeys.all, 'brands'] as const,
    queryFn: async () => {
      const response = await listingApi.list({ limit: 500 });
      const brands = new Set<string>();
      for (const listing of response.data) {
        if (listing.brand) {
          brands.add(listing.brand);
        }
      }
      return Array.from(brands).sort((a, b) => a.localeCompare(b));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
