/**
 * GraphQL Client for ZoneVast APIs
 *
 * Uses fetch API with JWT authentication for GraphQL queries/mutations
 */

const GRAPHQL_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://test.zonevast.com';

// ============================================================================
// Error Logging Utilities
// ============================================================================

/**
 * Log GraphQL error with full context for debugging
 */
function logGraphQLError(error: Error, context: {
  url: string;
  service: string;
  locale: string;
  variables?: Record<string, unknown>;
  responseStatus?: number;
  responseStatusText?: string;
  graphqlErrors?: Array<{ message: string; path?: string[] }>;
}) {
  console.group(`❌ [GraphQL Error] ${context.service}/${context.locale}`);
  console.error('URL:', context.url);
  console.error('Error Message:', error.message);
  if (context.responseStatus) {
    console.error('HTTP Status:', context.responseStatus, context.responseStatusText);
  }
  if (context.graphqlErrors && context.graphqlErrors.length > 0) {
    console.error('GraphQL Errors:', context.graphqlErrors);
  }
  if (context.variables && Object.keys(context.variables).length > 0) {
    console.error('Variables:', context.variables);
  }
  console.error('Timestamp:', new Date().toISOString());
  console.groupEnd();
}

/**
 * Log successful GraphQL request (for debugging)
 */
function logGraphQLSuccess(context: {
  url: string;
  service: string;
  locale: string;
  variables?: Record<string, unknown>;
}) {
  console.log(`✅ [GraphQL] ${context.service}/${context.locale}`, {
    url: context.url,
    hasVariables: !!context.variables && Object.keys(context.variables).length > 0
  });
}

const PROJECT_STORAGE_KEY = 'zv_project';

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
 * Get project ID from localStorage or cookies
 */
function getProjectId(): string {
  // Check cookies first (most reliable for cross-app sync)
  const cookies = document.cookie.split(';');
  const projectCookie = cookies.find(c => c.trim().startsWith('project_id='));
  if (projectCookie) {
    return projectCookie.split('=')[1]?.trim() || '11';
  }

  // Check localStorage if not in cookies
  const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
  if (stored) {
    try {
      const project = JSON.parse(stored);
      // Valid project ID should be numeric or a specific valid string
      if (project.id && !isNaN(Number(project.id))) {
        return project.id;
      }
    } catch {
      // Ignore
    }
  }

  // Fallback to production default
  return '11'; 
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
  // Build GraphQL URL: {baseURL}/graphql/{service}/{locale}/v1/graphql
  // Remove trailing slash from baseURL, no trailing slash on endpoint
  const baseUrl = GRAPHQL_BASE_URL.replace(/\/$/, '');
  const url = `${baseUrl}/graphql/${service}/${locale}/v1/graphql`;

  const requestContext = { url, service, locale, variables };

  const token = getAuthToken();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        'X-Project-ID': getProjectId(),
      },
      body: JSON.stringify({ query, variables }),
    });

    // Log request for debugging
    logGraphQLSuccess(requestContext);

    // Handle HTTP errors
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      logGraphQLError(error, {
        ...requestContext,
        responseStatus: response.status,
        responseStatusText: response.statusText
      });
      throw error;
    }

    const result: GraphQLResponse<T> = await response.json();

    // Handle GraphQL errors
    if (result.errors && result.errors.length > 0) {
      const errorMessages = result.errors.map(e => e.message).join(', ');
      const error = new Error(`GraphQL Error: ${errorMessages}`);
      logGraphQLError(error, {
        ...requestContext,
        graphqlErrors: result.errors
      });
      throw error;
    }

    // Handle empty response
    if (!result.data) {
      const error = new Error('GraphQL: No data returned from server');
      logGraphQLError(error, requestContext);
      throw error;
    }

    return result.data;
  } catch (err) {
    // Re-throw with logging if it hasn't been logged yet
    if (err instanceof Error) {
      // Only log if it's not a GraphQL error we already logged
      if (!err.message.includes('GraphQL Error') && !err.message.includes('HTTP ')) {
        logGraphQLError(err, requestContext);
      }
    }
    throw err;
  }
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
