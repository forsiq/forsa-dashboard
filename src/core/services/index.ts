/**
 * Core Service Factory - Main Export
 *
 * Provides a complete CRUD service generation system:
 * - createCrudService: Generate full service with hooks
 * - createApiClient: Generate API client only
 * - createQueryKeys: Generate React Query keys
 *
 * @example
 * import { createCrudService } from '@core/services';
 *
 * const categoryService = createCrudService({
 *   name: 'categories',
 *   endpoint: '/api/v1/categories',
 * });
 */

// Main factory
export { createCrudService } from './CrudServiceFactory';

// Individual factories
export { createApiClient, createUploadClient, uploadFile } from './ApiClientFactory';
export { createQueryKeys, isListKey, isDetailKey, isStatsKey } from './QueryKeysFactory';

// GraphQL client
export { graphqlRequest, gqlQuery, gqlMutation } from './GraphQLClient';
export type { GraphQLOptions, GraphQLResponse } from './GraphQLClient';

// Hook generators (for advanced usage)
export { createQueryHooks } from './CrudServiceFactory';
export { createMutationHooks } from './CrudServiceFactory';

// Types
export type {
  // Entity types
  BaseEntity,
  Timestamps,
  // Filter & Query types
  ListParams,
  ListFilters,
  // API Response types
  ApiError,
  ApiResponse,
  // CRUD Operation types
  CrudOperations,
  // Stats types
  EntityStats,
  // Service config types
  ServiceEndpoints,
  ServiceListConfig,
  ColumnConfig,
  ServiceFormConfig,
  FormFieldConfig,
  ServiceConfig,
  ServicePermissions,
  // Query Keys types
  QueryKeysFactory,
  // Hook types
  UseMutationOptions,
  UseQueryOptions,
} from './types';

// Type helpers
export type { CrudService, ServiceQueries, ServiceMutations } from './CrudServiceFactory';

// Factory config types
export type { CrudServiceConfig } from './CrudServiceFactory';
export type { ApiClientFactoryConfig } from './ApiClientFactory';
