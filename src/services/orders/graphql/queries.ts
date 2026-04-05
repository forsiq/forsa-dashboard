/**
 * GraphQL Queries & Mutations for Orders
 * Uses 'order' service
 */

// ============ Queries ============

/**
 * Get paginated list of orders
 */
export const GET_ORDERS_QUERY = `
  query GetOrders(
    $limit: Int
    $offset: Int
    $search: String
    $status: String
    $paymentStatus: String
    $customerId: ID
    $startDate: String
    $endDate: String
    $sortBy: String
    $sortOrder: String
  ) {
    orders(
      limit: $limit
      offset: $offset
      search: $search
      status: $status
      paymentStatus: $paymentStatus
      customerId: $customerId
      startDate: $startDate
      endDate: $endDate
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      id
      orderNumber
      customerId
      total
      status
      paymentStatus
      priority
      createdAt
      updatedAt
      customer {
        id
        firstName
        lastName
        email
      }
      items {
        id
        productId
        productName
        quantity
        unitPrice
        totalPrice
      }
    }
    orderCount(
      search: $search
      status: $status
      paymentStatus: $paymentStatus
      customerId: $customerId
      startDate: $startDate
      endDate: $endDate
    )
  }
`;

/**
 * Get a single order by ID
 */
export const GET_ORDER_QUERY = `
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      orderNumber
      customerId
      subtotal
      tax
      shipping
      discount
      total
      currency
      status
      paymentStatus
      priority
      notes
      createdAt
      updatedAt
      customer {
        id
        firstName
        lastName
        email
      }
      items {
        id
        productId
        productName
        productSku
        quantity
        unitPrice
        totalPrice
      }
      shippingAddress {
        fullName
        phone
        country
        state
        city
        street
        building
        floor
        apartment
        postalCode
      }
      billingAddress {
        fullName
        phone
        country
        state
        city
        street
        building
        floor
        apartment
        postalCode
      }
    }
  }
`;

/**
 * Get order statistics
 */
export const GET_ORDER_STATS_QUERY = `
  query GetOrderStats {
    orderStats {
      total
      pending
      processing
      shipped
      delivered
      cancelled
      refunded
      totalRevenue
      todayOrders
      todayRevenue
      averageOrderValue
    }
  }
`;

// ============ Mutations ============

/**
 * Create a new order
 */
export const CREATE_ORDER_MUTATION = `
  mutation CreateOrder($input: OrderInput!) {
    createOrder(input: $input) {
      id
      orderNumber
      status
    }
  }
`;

/**
 * Update an existing order
 */
export const UPDATE_ORDER_MUTATION = `
  mutation UpdateOrder($id: ID!, $input: OrderInput!) {
    updateOrder(id: $id, input: $input) {
      id
      status
      paymentStatus
    }
  }
`;

// ============ Helper Functions ============

/**
 * Build variables for order list query
 */
export function buildOrderVariables(filters: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  return {
    limit: filters.limit || 50,
    offset: filters.page ? ((filters.page - 1) * (filters.limit || 50)) : 0,
    ...(filters.search && { search: filters.search }),
    ...(filters.status && filters.status !== 'all' && { status: filters.status }),
    ...(filters.paymentStatus && filters.paymentStatus !== 'all' && { paymentStatus: filters.paymentStatus }),
    ...(filters.customerId && { customerId: filters.customerId }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.sortBy && { sortBy: filters.sortBy }),
    ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
  };
}
