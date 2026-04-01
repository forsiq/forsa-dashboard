/**
 * Customer GraphQL API Functions
 * Exports GraphQL-based API for customers service
 */

export {
  getCustomers,
  getCustomer,
  getCustomerStats,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateCustomerStatus,
  customerKeys,
} from '../graphql/api';
