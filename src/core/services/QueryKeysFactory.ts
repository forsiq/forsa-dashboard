/**
 * Query Keys Factory
 * Generates React Query keys for CRUD operations
 */

import type { QueryKeysFactory as QueryKeysFactoryType } from './types';

/**
 * Creates query keys for a service
 * @param serviceName - Name of the service (e.g., 'categories', 'customers')
 * @returns Query keys object
 *
 * @example
 * const categoryKeys = createQueryKeys('categories');
 *
 * // Usage:
 * queryKey: categoryKeys.all                    // ['categories']
 * queryKey: categoryKeys.lists()                // ['categories', 'list']
 * queryKey: categoryKeys.list({ page: 1 })      // ['categories', 'list', { page: 1 }]
 * queryKey: categoryKeys.details()              // ['categories', 'detail']
 * queryKey: categoryKeys.detail('123')          // ['categories', 'detail', '123']
 * queryKey: categoryKeys.stats()                // ['categories', 'stats']
 */
export function createQueryKeys(serviceName: string): QueryKeysFactoryType {
  const base = [serviceName] as const;

  return {
    all: base,

    lists: () => [...base, 'list'] as const,

    list: (filters: unknown) => [...base, 'list', filters] as const,

    details: () => [...base, 'detail'] as const,

    detail: (id: string) => [...base, 'detail', id] as const,

    stats: () => [...base, 'stats'] as const,
  };
}

/**
 * Type guard for query keys
 */
export function isListKey(key: readonly string[]): boolean {
  return key.includes('list');
}

export function isDetailKey(key: readonly string[]): boolean {
  return key.includes('detail');
}

export function isStatsKey(key: readonly string[]): boolean {
  return key.includes('stats');
}

/**
 * Extract service name from query key
 */
export function getServiceNameFromKey(key: readonly string[]): string | null {
  if (key.length > 0 && typeof key[0] === 'string') {
    return key[0];
  }
  return null;
}

/**
 * Extract entity ID from detail query key
 */
export function getEntityIdFromKey(key: readonly string[]): string | null {
  if (isDetailKey(key) && key.length > 2) {
    const id = key[key.length - 1];
    if (typeof id === 'string') {
      return id;
    }
  }
  return null;
}
