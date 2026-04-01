/**
 * GraphQL Client for ZoneVast APIs
 *
 * Uses fetch API with JWT authentication for GraphQL queries/mutations
 */

const GRAPHQL_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Get auth token from storage
 */
function getAuthToken(): string | null {
  const cookies = document.cookie.split(';');
  const accessCookie = cookies.find(c => c.trim().startsWith('access='));
  if (accessCookie) {
    return accessCookie.split('=')[1]?.trim() || null;
  }
  return localStorage.getItem('access_token');
}

/**
 * GraphQL Request Options
 */
export interface GraphQLOptions {
  query: string;
  variables?: Record<string, unknown>;
  service?: string; // e.g., 'customer', 'product', 'order'
  locale?: string;
}

/**
 * GraphQL Response Type
 */
export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    path?: string[];
    extensions?: Record<string, unknown>;
  }>;
}

/**
 * Make a GraphQL request
 *
 * @example
 * const data = await graphqlRequest<{ customers: Customer[] }>({
 *   service: 'customer',
 *   query: `query GetCustomers { customers { id name email } }`
 * });
 */
export async function graphqlRequest<T = unknown>({
  query,
  variables = {},
  service = 'customer',
  locale = 'en',
}: GraphQLOptions): Promise<T> {
  // Build GraphQL URL: /graphql/{service}/{locale}/v1/graphql
  const url = `${GRAPHQL_BASE_URL}/graphql/${service}/${locale}/v1/graphql`;

  const token = getAuthToken();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      'X-Project-ID': '11',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors && result.errors.length > 0) {
    const errorMessages = result.errors.map(e => e.message).join(', ');
    throw new Error(`GraphQL Error: ${errorMessages}`);
  }

  if (!result.data) {
    throw new Error('GraphQL: No data returned');
  }

  return result.data;
}

/**
 * GraphQL Query Helper
 */
export async function gqlQuery<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  service = 'customer'
): Promise<T> {
  return graphqlRequest<T>({ query, variables, service });
}

/**
 * GraphQL Mutation Helper
 */
export async function gqlMutation<T = unknown>(
  mutation: string,
  variables: Record<string, unknown>,
  service = 'customer'
): Promise<T> {
  return graphqlRequest<T>({ query: mutation, variables, service });
}
