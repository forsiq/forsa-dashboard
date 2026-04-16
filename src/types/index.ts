/**
 * ZoneVast Template - Main Types Export
 *
 * Centralized type definitions for the entire application
 *
 * Structure:
 * - @types/common  - Shared types (ApiResponse, pagination, etc.)
 * - @types/services - Ready-made service types (categories, orders, etc.)
 * - @types/features - Feature types (dashboard, settings, auth, etc.)
 */

// Common types - shared by all
export * from './common';

// Service types - ready-made modules
export * from './services/categories.types';
export * from './services/customers.types';
export * from './services/orders.types';
export * from './services/inventory.types';
export * from './services/reports.types';

// Feature types - developer workspace
export * from './features/dashboard.types';
export * from './features/settings.types';
export * from './features/auth.types';
