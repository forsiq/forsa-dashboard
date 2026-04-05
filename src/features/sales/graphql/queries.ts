/**
 * GraphQL Queries & Mutations for Group Buying
 */

// ============ Queries ============

/**
 * Get paginated list of group buying campaigns
 */
export const GET_GROUP_BUYINGS_QUERY = `
  query GetGroupBuyings(
    $limit: Int
    $offset: Int
    $search: String
    $status: String
    $categoryId: String
    $sortBy: String
    $sortOrder: String
  ) {
    groupBuyings(
      limit: $limit
      offset: $offset
      search: $search
      status: $status
      categoryId: $categoryId
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      id
      title
      description
      slug
      productId
      categoryId
      originalPrice
      dealPrice
      minParticipants
      maxParticipants
      currentParticipants
      startTime
      endTime
      status
      isUnlocked
      autoCreateOrder
      projectId
      createdAt
      updatedAt
    }
    groupBuyingCount(
      search: $search
      status: $status
      categoryId: $categoryId
    )
  }
`;

/**
 * Get a single group buying campaign by ID
 */
export const GET_GROUP_BUYING_QUERY = `
  query GetGroupBuying($id: ID!) {
    groupBuying(id: $id) {
      id
      title
      description
      slug
      productId
      categoryId
      originalPrice
      dealPrice
      minParticipants
      maxParticipants
      currentParticipants
      startTime
      endTime
      status
      isUnlocked
      autoCreateOrder
      projectId
      createdAt
      updatedAt
      category {
        id
        name
        nameAr
        slug
      }
      item {
        id
        title
        description
        images
      }
    }
  }
`;

/**
 * Get group buying statistics
 */
export const GET_GROUP_BUYING_STATS_QUERY = `
  query GetGroupBuyingStats {
    groupBuyingStats {
      activeCampaigns
      completedCampaigns
      totalParticipants
      totalRevenue
    }
  }
`;

/**
 * Get participants for a group buying campaign
 */
export const GET_GROUP_BUYING_PARTICIPANTS_QUERY = `
  query GetGroupBuyingParticipants($id: ID!, $limit: Int, $offset: Int) {
    groupBuyingParticipants(id: $id, limit: $limit, offset: $offset) {
      id
      userId
      userName
      userPhone
      quantity
      joinedAt
      status
    }
    participantCount(id: $id)
  }
`;

// ============ Mutations ============

/**
 * Create a new group buying campaign
 */
export const CREATE_GROUP_BUYING_MUTATION = `
  mutation CreateGroupBuying($input: GroupBuyingInput!) {
    createGroupBuying(input: $input) {
      id
      title
      description
      slug
      productId
      categoryId
      originalPrice
      dealPrice
      minParticipants
      maxParticipants
      currentParticipants
      startTime
      endTime
      status
      isUnlocked
      autoCreateOrder
      projectId
      createdAt
      updatedAt
    }
  }
`;

/**
 * Update an existing group buying campaign
 */
export const UPDATE_GROUP_BUYING_MUTATION = `
  mutation UpdateGroupBuying($id: ID!, $input: GroupBuyingInput!) {
    updateGroupBuying(id: $id, input: $input) {
      id
      title
      description
      slug
      productId
      categoryId
      originalPrice
      dealPrice
      minParticipants
      maxParticipants
      currentParticipants
      startTime
      endTime
      status
      isUnlocked
      autoCreateOrder
      projectId
      createdAt
      updatedAt
    }
  }
`;

/**
 * Delete a group buying campaign
 */
export const DELETE_GROUP_BUYING_MUTATION = `
  mutation DeleteGroupBuying($id: ID!) {
    deleteGroupBuying(id: $id) {
      success
      message
    }
  }
`;

/**
 * Update group buying campaign status
 */
export const UPDATE_GROUP_BUYING_STATUS_MUTATION = `
  mutation UpdateGroupBuyingStatus($id: ID!, $status: GroupBuyingStatus!) {
    updateGroupBuyingStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

/**
 * Join a group buying campaign
 */
export const JOIN_GROUP_BUYING_MUTATION = `
  mutation JoinGroupBuying($groupBuyingId: ID!, $quantity: Int!) {
    joinGroupBuying(groupBuyingId: $groupBuyingId, quantity: $quantity) {
      id
      groupBuyingId
      userId
      userName
      userPhone
      quantity
      joinedAt
      status
    }
  }
`;

// ============ Helper Functions ============

/**
 * Build variables for group buying list query
 */
export function buildGroupBuyingVariables(filters: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  return {
    limit: filters.limit || 50,
    offset: filters.page ? ((filters.page - 1) * (filters.limit || 50)) : 0,
    ...(filters.search && { search: filters.search }),
    ...(filters.status && filters.status !== 'all' && { status: filters.status }),
    ...(filters.categoryId && filters.categoryId !== 'all' && { categoryId: filters.categoryId }),
    ...(filters.sortBy && { sortBy: filters.sortBy }),
    ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
  };
}
