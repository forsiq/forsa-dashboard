/**
 * GraphQL Queries & Mutations for Items (Products)
 * Uses 'product' service
 */

// ============ Queries ============

/**
 * Get paginated list of products
 */
export const GET_PRODUCTS_QUERY = `
  query GetProducts(
    $limit: Int
    $offset: Int
    $search: String
    $categoryId: Int
    $status: String
  ) {
    products(
      limit: $limit
      offset: $offset
      search: $search
      categoryId: $categoryId
      status: $status
    ) {
      id
      idNum
      name
      nameAr
      description
      descriptionAr
      sku
      price
      status
      images
      categoryId
      category {
        id
        name
        nameAr
      }
      createdAt
      updatedAt
      auctionCount
    }
    productCount(
      search: $search
      categoryId: $categoryId
      status: $status
    )
  }
`;

/**
 * Get a single product by ID
 */
export const GET_PRODUCT_QUERY = `
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      idNum
      name
      nameAr
      description
      descriptionAr
      sku
      price
      status
      images
      categoryId
      category {
        id
        name
        nameAr
      }
      createdAt
      updatedAt
      auctionCount
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
  categoryId?: number;
  status?: string;
}) {
  return {
    limit: filters.limit || 50,
    offset: filters.page ? ((filters.page - 1) * (filters.limit || 50)) : 0,
    ...(filters.search && { search: filters.search }),
    ...(filters.categoryId && filters.categoryId !== 0 && { categoryId: filters.categoryId }),
    ...(filters.status && filters.status !== 'all' && { status: filters.status }),
  };
}
