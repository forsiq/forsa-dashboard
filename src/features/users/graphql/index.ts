/**
 * User GraphQL Module - Public API
 *
 * Exports all hooks and utilities for user management
 */

// Query Hooks
export {
  useGetUsers,
  useGetUser,
  useGetUserStats,
} from './hooks';

// Mutation Hooks
export {
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useUpdateUserStatus,
  useResetUserPassword,
} from './hooks';

// Prefetch Functions
export {
  prefetchUser,
} from './hooks';

// Query Keys
export { userKeys } from './api';

// Types
export type {
  User,
  UserCreateInput,
  UserUpdateInput,
  UserFilters,
  UsersResponse,
  UserStats,
  UserFormData,
} from '../types';
