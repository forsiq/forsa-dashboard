/**
 * GraphQL Queries & Mutations for Inventory/Products
 * Uses 'inventory' service
 */

// ============ Queries ============

/**
 * Get paginated list of products (inventory items)
 */
export const GET_PRODUCTS_QUERY = `
  query GetProducts(
    $limit: Int
    $offset: Int
    $search: String
  ) {
    products(
      limit: $limit
      offset: $offset
      search: $search
    ) {
      id
      title
      slug
      status
      categoryId
      additionalData
      createdAt
      updatedAt
    }
  }
`;

/**
 * Get a single product by ID
 */
export const GET_PRODUCT_QUERY = `
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      title
      slug
      status
      categoryId
      additionalData
      createdAt
      updatedAt
    }
  }
`;

/**
 * Get inventory statistics
 */
export const GET_INVENTORY_STATS_QUERY = `
  query GetInventoryStats {
    inventoryStats {
      totalProducts
      inStock
      lowStock
      outOfStock
      totalValue
      lowStockValue
      totalStock
      recentMovements
    }
  }
`;

// ============ Mutations ============

/**
 * Create a new product
 */
export const CREATE_PRODUCT_MUTATION = `
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      id
      name
      sku
      status
    }
  }
`;

/**
 * Update an existing product
 */
export const UPDATE_PRODUCT_MUTATION = `
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      sku
      status
    }
  }
`;

/**
 * Delete a product
 */
export const DELETE_PRODUCT_MUTATION = `
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      success
      message
    }
  }
`;

// ============ Helper Functions ============

/**
 * Build variables for product list query
 */
export function buildProductVariables(filters: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  stockStatus?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  return {
    limit: filters.limit || 50,
    offset: filters.page ? ((filters.page - 1) * (filters.limit || 50)) : 0,
    ...(filters.search && { search: filters.search }),
    // Note: categoryId, stockStatus filters applied client-side
  };
}
