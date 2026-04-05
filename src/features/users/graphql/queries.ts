/**
 * GraphQL Queries & Mutations for User Management
 */

// ============ Queries ============

/**
 * Get paginated list of users
 */
export const GET_USERS_QUERY = `
  query GetUsers($page: Int, $limit: Int, $search: String, $role: String, $status: String) {
    users(page: $page, limit: $limit, search: $search, role: $role, status: $status) {
      id
      userName
      fullName
      email
      phone
      role
      isActive
      isTempPass
      createdAt
      updatedAt
    }
    userCount(search: $search, role: $role, status: $status)
  }
`;

/**
 * Get a single user by ID
 */
export const GET_USER_QUERY = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      userName
      fullName
      email
      phone
      role
      isActive
      isTempPass
      createdAt
      updatedAt
    }
  }
`;

/**
 * Get user statistics
 */
export const GET_USER_STATS_QUERY = `
  query GetUserStats {
    userStats {
      total
      active
      inactive
      admins
      managers
      newThisMonth
    }
  }
`;

// ============ Mutations ============

/**
 * Create a new user
 */
export const CREATE_USER_MUTATION = `
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      id
      userName
      fullName
      email
      phone
      role
      isActive
      createdAt
    }
  }
`;

/**
 * Update an existing user
 */
export const UPDATE_USER_MUTATION = `
  mutation UpdateUser($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      id
      userName
      fullName
      email
      phone
      role
      isActive
      updatedAt
    }
  }
`;

/**
 * Delete a user
 */
export const DELETE_USER_MUTATION = `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`;

/**
 * Update user status
 */
export const UPDATE_USER_STATUS_MUTATION = `
  mutation UpdateUserStatus($id: ID!, $isActive: Boolean!) {
    updateUserStatus(id: $id, isActive: $isActive) {
      id
      isActive
    }
  }
`;

/**
 * Reset user password
 */
export const RESET_USER_PASSWORD_MUTATION = `
  mutation ResetUserPassword($id: ID!) {
    resetUserPassword(id: $id) {
      success
      message
    }
  }
`;
