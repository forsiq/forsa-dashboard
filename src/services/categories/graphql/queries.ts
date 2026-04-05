/**
 * GraphQL Queries & Mutations for Categories
 * Uses 'product' service for category operations
 */

// ============================================================================
// Queries
// ============================================================================

export const GET_CATEGORIES_QUERY = `
  query GetCategories($limit: Int, $offset: Int, $status: String) {
    categories(limit: $limit, offset: $offset, status: $status) {
      id
      name
      nameAr
      slug
      description
      status
      order
      parentId
      createdAt
      updatedAt
    }
    categoryCount
  }
`;

export const GET_CATEGORY_QUERY = `
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
      nameAr
      slug
      description
      status
      order
      parentId
      createdAt
      updatedAt
    }
  }
`;

export const GET_CATEGORY_STATS_QUERY = `
  query GetCategoryStats {
    categoryStats {
      total
      active
      inactive
      withParent
      withoutParent
    }
  }
`;

// ============================================================================
// Mutations
// ============================================================================

export const CREATE_CATEGORY_MUTATION = `
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      id
      name
      nameAr
      slug
      description
      status
      order
      parentId
    }
  }
`;

export const UPDATE_CATEGORY_MUTATION = `
  mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      nameAr
      slug
      description
      status
      order
      parentId
    }
  }
`;

export const DELETE_CATEGORY_MUTATION = `
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id) {
      success
      message
    }
  }
`;

export const UPDATE_CATEGORY_STATUS_MUTATION = `
  mutation UpdateCategoryStatus($id: ID!, $status: String!) {
    updateCategoryStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build variables for category list query
 */
export function buildCategoryVariables(filters: {
  page?: number;
  limit?: number;
  status?: string;
  parentId?: string;
}) {
  return {
    limit: filters.limit || 50,
    offset: filters.page ? ((filters.page - 1) * (filters.limit || 50)) : 0,
    ...(filters.status && filters.status !== 'all' && { status: filters.status }),
  };
}
