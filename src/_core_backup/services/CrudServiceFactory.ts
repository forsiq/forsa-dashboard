/**
 * CRUD Service Factory
 * Generates complete CRUD service with API client, hooks, and types
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type { ServiceConfig, CrudOperations, ListParams, EntityStats } from './types';
import { createApiClient } from './ApiClientFactory';
import { createQueryKeys } from './QueryKeysFactory';

// ============================================================================
// Hook Generators
// ============================================================================

/**
 * Creates query hooks for a service
 */
export function createQueryHooks<TEntity, TFilters = ListParams>(
  serviceName: string,
  apiClient: ReturnType<typeof createApiClient>
) {
  const queryKeys = createQueryKeys(serviceName);

  return {
    /**
     * Hook to fetch list of entities
     */
    useList: (
      filters?: TFilters,
      options?: { enabled?: boolean; refetchOnWindowFocus?: boolean }
    ): UseQueryResult<TEntity[], unknown> => {
      return useQuery({
        queryKey: queryKeys.list(filters || {}) as any,
        queryFn: async (): Promise<TEntity[]> => {
          const response = await apiClient.list(filters);
          return (response.data || []) as TEntity[];
        },
        enabled: options?.enabled ?? true,
        refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      }) as UseQueryResult<TEntity[], unknown>;
    },

    /**
     * Hook to fetch paginated list
     */
    usePaginatedList: (
      filters?: TFilters,
      options?: { enabled?: boolean }
    ): UseQueryResult<{ data: TEntity[]; total: number; page: number; limit: number }, unknown> => {
      return useQuery({
        queryKey: queryKeys.list(filters || {}) as any,
        queryFn: async () => {
          const response = await apiClient.list(filters);
          return {
            data: (response.data || []) as TEntity[],
            total: ((response as any).total || 0) as number,
            page: ((filters as any)?.page || 1) as number,
            limit: ((filters as any)?.limit || 20) as number,
          };
        },
        enabled: options?.enabled ?? true,
      }) as UseQueryResult<{ data: TEntity[]; total: number; page: number; limit: number }, unknown>;
    },

    /**
     * Hook to fetch single entity by ID
     */
    useById: (
      id: string,
      options?: { enabled?: boolean }
    ): UseQueryResult<TEntity, unknown> => {
      return useQuery({
        queryKey: queryKeys.detail(id),
        queryFn: async (): Promise<TEntity> => {
          const response = await apiClient.getById(id);
          return response.data as TEntity;
        },
        enabled: options?.enabled ?? !!id,
      }) as UseQueryResult<TEntity, unknown>;
    },

    /**
     * Hook to fetch entity statistics
     */
    useStats: (
      options?: { enabled?: boolean }
    ): UseQueryResult<EntityStats, unknown> => {
      return useQuery({
        queryKey: queryKeys.stats(),
        queryFn: async (): Promise<EntityStats> => {
          const response = await apiClient.getStats();
          return response.data as EntityStats;
        },
        enabled: options?.enabled ?? true,
      }) as UseQueryResult<EntityStats, unknown>;
    },

    /**
     * Export query keys for external use
     */
    queryKeys,
  };
}

/**
 * Creates mutation hooks for a service
 */
export function createMutationHooks<TEntity, TCreateInput, TUpdateInput>(
  serviceName: string,
  apiClient: ReturnType<typeof createApiClient>
) {
  const queryKeys = createQueryKeys(serviceName);

  return {
    /**
     * Hook to create a new entity
     */
    useCreate: (options?: {
      onSuccess?: (data: TEntity) => void;
      onError?: (error: unknown) => void;
    }) => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: (input: TCreateInput) => apiClient.create(input),
        onSuccess: (data) => {
          // Invalidate list queries
          queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
          options?.onSuccess?.(data.data as TEntity);
        },
        onError: options?.onError,
      });
    },

    /**
     * Hook to update an entity
     */
    useUpdate: (options?: {
      onSuccess?: (data: TEntity) => void;
      onError?: (error: unknown) => void;
    }) => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: (input: TUpdateInput & { id: string }) => apiClient.update(input),
        onMutate: async (variables) => {
          const id = variables.id;
          // Cancel outgoing refetches
          await queryClient.cancelQueries({ queryKey: queryKeys.detail(id) });

          // Snapshot previous value
          const previous = queryClient.getQueryData(queryKeys.detail(id));

          // Optimistically update
          queryClient.setQueryData(
            queryKeys.detail(id),
            (old: any) => ({ ...old, ...variables })
          );

          return { previous };
        },
        onError: (error, variables, context) => {
          // Rollback on error
          if (context?.previous) {
            queryClient.setQueryData(
              queryKeys.detail(variables.id),
              context.previous
            );
          }
          options?.onError?.(error);
        },
        onSuccess: (data) => {
          // Invalidate related queries
          queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
          queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
          options?.onSuccess?.(data.data as TEntity);
        },
      });
    },

    /**
     * Hook to delete an entity
     */
    useDelete: (options?: {
      onSuccess?: () => void;
      onError?: (error: unknown) => void;
    }) => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: (id: string) => apiClient.delete(id),
        onMutate: async (id) => {
          await queryClient.cancelQueries({ queryKey: queryKeys.lists() });

          const previous = queryClient.getQueryData(queryKeys.lists());

          // Optimistically remove from cache
          queryClient.setQueryData(
            queryKeys.lists(),
            (old: any) => ({
              ...old,
              data: old?.data?.filter((item: any) => item.id !== id) || [],
              total: (old?.total || 0) - 1,
            })
          );

          return { previous };
        },
        onError: (error, _, context) => {
          if (context?.previous) {
            queryClient.setQueryData(queryKeys.lists(), context.previous);
          }
          options?.onError?.(error);
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
          queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
          options?.onSuccess?.();
        },
      });
    },

    /**
     * Hook to bulk delete entities
     */
    useBulkDelete: (options?: {
      onSuccess?: () => void;
      onError?: (error: unknown) => void;
    }) => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: (ids: string[]) => apiClient.bulkDelete(ids),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
          queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
          options?.onSuccess?.();
        },
        onError: options?.onError,
      });
    },
  };
}

// ============================================================================
// Main Service Factory
// ============================================================================

export interface CrudServiceConfig {
  name: string;
  endpoint: string;
  endpoints?: Partial<{
    list: string;
    detail: string;
    create: string;
    update: string;
    delete: string;
    stats: string;
  }>;
  apiBaseUrl?: string;
}

/**
 * Creates a complete CRUD service with API client, queries, and mutations
 *
 * @example
 * const categoryService = createCrudService<Category, CreateCategory, UpdateCategory>({
 *   name: 'categories',
 *   endpoint: '/api/v1/categories',
 * });
 *
 * // Usage:
 * const { useList, useById, useCreate, useUpdate, useDelete, queryKeys } = categoryService;
 *
 * function CategoryList() {
 *   const { data: categories, isLoading } = useList({ page: 1, limit: 20 });
 *   const createMutation = useCreate();
 *   // ...
 * }
 */
export function createCrudService<TEntity, TCreateInput, TUpdateInput, TFilters = ListParams>(
  config: CrudServiceConfig
) {
  const { name, endpoint, endpoints, apiBaseUrl } = config;

  // Create API client
  const apiClient = createApiClient<TEntity, TCreateInput, TUpdateInput, TFilters>({
    serviceName: name,
    endpoint,
    endpoints,
    apiBaseUrl,
  });

  // Create query hooks
  const queries = createQueryHooks<TEntity, TFilters>(name, apiClient);

  // Create mutation hooks
  const mutations = createMutationHooks<TEntity, TCreateInput, TUpdateInput>(name, apiClient);

  // Return complete service
  return {
    // API client (for direct use if needed)
    api: apiClient,

    // Query hooks
    ...queries,

    // Mutation hooks
    ...mutations,

    // Service metadata
    name,
    endpoint,
  };
}

// ============================================================================
// Type Helpers
// ============================================================================

/**
 * Extract the type returned by createCrudService
 */
export type CrudService<TEntity, TCreateInput, TUpdateInput, TFilters = ListParams> = ReturnType<
  typeof createCrudService<TEntity, TCreateInput, TUpdateInput, TFilters>
>;

/**
 * Extract query hooks from a service
 */
export type ServiceQueries<TEntity, TFilters = ListParams> = ReturnType<
  typeof createQueryHooks<TEntity, TFilters>
>;

/**
 * Extract mutation hooks from a service
 */
export type ServiceMutations<TEntity, TCreateInput, TUpdateInput> = ReturnType<
  typeof createMutationHooks<TEntity, TCreateInput, TUpdateInput>
>;
