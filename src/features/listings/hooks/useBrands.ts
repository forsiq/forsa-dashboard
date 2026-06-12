import { useQuery } from '@tanstack/react-query';
import { listingApi } from '../api/listing-api';
import { listingKeys } from '../api/listing-hooks';

const STORAGE_KEY = 'forsa_brands';

function getLocalStorageBrands(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveBrandToLocalStorage(brand: string) {
  if (!brand.trim()) return;
  try {
    const existing = getLocalStorageBrands();
    if (!existing.includes(brand)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, brand]));
    }
  } catch {}
}

export function useBrands() {
  return useQuery({
    queryKey: [...listingKeys.all, 'brands'] as const,
    queryFn: async () => {
      try {
        const response = await listingApi.list({ limit: 500 });
        const apiBrands = new Set<string>();
        for (const listing of response.data) {
          if (listing.brand) {
            apiBrands.add(listing.brand);
          }
        }
        const localBrands = getLocalStorageBrands();
        for (const b of localBrands) {
          apiBrands.add(b);
        }
        return Array.from(apiBrands).sort((a, b) => a.localeCompare(b));
      } catch {
        return getLocalStorageBrands();
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
