/**
 * Customer Service Configuration
 *
 * IMPORTANT: Customers use GraphQL, not REST API
 * GraphQL Endpoint: /graphql/customer/en/v1/graphql
 */

import type { CrudServiceConfig } from '@core/services';
import type { Customer, CreateCustomerInput, UpdateCustomerInput, CustomerFilters } from '../types';
import { customerEntityMeta } from './entity.schema';
import { customerListConfig } from './list.config';
import { customerFormConfig } from './form.config';

/**
 * Customer Service Configuration
 *
 * Note: This config is for metadata only. The actual API calls use GraphQL.
 * See ../graphql/ for the GraphQL implementation.
 */
export const customerServiceConfig: CrudServiceConfig = {
  name: 'customers',
  endpoint: '/graphql/customer/en/v1/graphql', // GraphQL endpoint
};

// Export types and configurations
export type { Customer, CreateCustomerInput, UpdateCustomerInput, CustomerFilters };
export { customerEntityMeta, customerListConfig, customerFormConfig };

// GraphQL API and hooks are exported from ../graphql/
// REST API and hooks
export * from '../api/customers';
export * from '../hooks';
