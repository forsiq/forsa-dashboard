/**
 * GraphQL Queries & Mutations for Customers Service
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get paginated list of customers
 */
export const GET_CUSTOMERS_QUERY = `
  query GetCustomers($page: Int, $limit: Int, $search: String, $status: String, $type: String) {
    customers(page: $page, limit: $limit, search: $search, status: $status, type: $type) {
      id
      name
      email
      phone
      avatar
      status
      type
      company
      address {
        street
        city
        state
        zipCode
        country
      }
      totalOrders
      totalSpent
      lastOrderDate
      createdAt
      updatedAt
    }
    customerCount(search: $search, status: $status, type: $type)
  }
`;

/**
 * Get a single customer by ID
 */
export const GET_CUSTOMER_QUERY = `
  query GetCustomer($id: ID!) {
    customer(id: $id) {
      id
      name
      email
      phone
      avatar
      status
      type
      company
      address {
        street
        city
        state
        zipCode
        country
      }
      totalOrders
      totalSpent
      lastOrderDate
      createdAt
      updatedAt
    }
  }
`;

/**
 * Get customer statistics
 */
export const GET_CUSTOMER_STATS_QUERY = `
  query GetCustomerStats {
    customerStats {
      total
      active
      inactive
      blocked
      newThisMonth
    }
  }
`;

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new customer
 */
export const CREATE_CUSTOMER_MUTATION = `
  mutation CreateCustomer($input: CustomerInput!) {
    createCustomer(input: $input) {
      id
      name
      email
      phone
      avatar
      status
      type
      company
      address {
        street
        city
        state
        zipCode
        country
      }
      createdAt
      updatedAt
    }
  }
`;

/**
 * Update an existing customer
 */
export const UPDATE_CUSTOMER_MUTATION = `
  mutation UpdateCustomer($id: ID!, $input: CustomerInput!) {
    updateCustomer(id: $id, input: $input) {
      id
      name
      email
      phone
      avatar
      status
      type
      company
      address {
        street
        city
        state
        zipCode
        country
      }
      totalOrders
      totalSpent
      lastOrderDate
      createdAt
      updatedAt
    }
  }
`;

/**
 * Delete a customer
 */
export const DELETE_CUSTOMER_MUTATION = `
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id) {
      success
      message
    }
  }
`;

/**
 * Update customer status
 */
export const UPDATE_CUSTOMER_STATUS_MUTATION = `
  mutation UpdateCustomerStatus($id: ID!, $status: String!) {
    updateCustomerStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

// ============================================================================
// Query Builders
// ============================================================================

/**
 * Build variables for customers list query
 */
export function buildCustomerVariables(filters: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}) {
  return {
    page: filters.page || 1,
    limit: filters.limit || 50,
    ...(filters.search && { search: filters.search }),
    ...(filters.status && filters.status !== 'all' && { status: filters.status }),
    ...(filters.type && filters.type !== 'all' && { type: filters.type }),
  };
}
