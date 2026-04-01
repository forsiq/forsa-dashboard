/**
 * Generic CRUD Types
 * Used by CrudServiceFactory to generate typed services
 */

import { PaginatedResponse } from '../../types/common';

// ============================================================================
// Entity Types
// ============================================================================

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Filter & Query Types
// ============================================================================

export interface ListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface ListFilters extends ListParams {
  [key: string]: unknown;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  status?: number;
}

export interface ApiResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
}

// ============================================================================
// CRUD Operation Types
// ============================================================================

export interface CrudOperations<Entity, CreateInput, UpdateInput, Filters = ListFilters> {
  // Queries
  list: (filters?: Filters) => Promise<PaginatedResponse<Entity>>;
  getById: (id: string) => Promise<Entity>;
  getStats: () => Promise<EntityStats>;

  // Mutations
  create: (input: CreateInput) => Promise<Entity>;
  update: (input: UpdateInput & { id: string }) => Promise<Entity>;
  delete: (id: string) => Promise<void>;
}

// ============================================================================
// Stats Types
// ============================================================================

export interface EntityStats {
  total: number;
  active?: number;
  inactive?: number;
  [key: string]: number | undefined;
}

// ============================================================================
// Service Config Types
// ============================================================================

export interface ServiceEndpoints {
  base: string;
  list?: string;
  detail?: string;
  create?: string;
  update?: string;
  delete?: string;
  stats?: string;
}

export interface ServiceListConfig {
  columns: ColumnConfig[];
  filters?: string[];
  defaultSort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pageSize?: number;
}

export interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  type?: 'text' | 'number' | 'date' | 'status' | 'badge' | 'image' | 'actions';
  align?: 'left' | 'center' | 'right';
}

export interface ServiceFormConfig {
  fields: FormFieldConfig[];
  validation?: Record<string, unknown>;
  submitUrl?: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'select' | 'checkbox' | 'radio' | 'date' | 'file' | 'image';
  placeholder?: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: unknown) => string | undefined;
  };
  disabled?: boolean;
  hidden?: boolean;
  grid?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

// ============================================================================
// Service Definition Types
// ============================================================================

export interface ServiceConfig<
  Entity extends BaseEntity,
  CreateInput,
  UpdateInput,
  Filters = ListFilters
> {
  name: string;
  endpoint: string;
  endpoints?: Partial<ServiceEndpoints>;
  schema?: Record<string, unknown>;
  list?: ServiceListConfig;
  form?: ServiceFormConfig;
  permissions?: ServicePermissions;
}

export interface ServicePermissions {
  read?: string;
  create?: string;
  update?: string;
  delete?: string;
}

// ============================================================================
// Query Keys Types
// ============================================================================

export interface QueryKeysFactory {
  all: readonly string[];
  lists: () => readonly string[];
  list: (filters: unknown) => readonly (string | unknown)[];
  details: () => readonly string[];
  detail: (id: string) => readonly string[];
  stats: () => readonly string[];
}

// ============================================================================
// Hook Types
// ============================================================================

export interface UseMutationOptions<TData, TError, TVariables> {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onMutate?: (variables: TVariables) => void;
}

export interface UseQueryOptions<TData, TError> {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}
