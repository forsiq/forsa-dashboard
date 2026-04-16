/**
 * Legacy router utility - Neutralized for Next.js
 * Next.js uses file-based routing in the pages directory.
 */

export interface FeatureRoute {
  path: string;
  element: React.ReactElement;
  children?: FeatureRoute[];
  layout?: 'auth' | 'dashboard' | 'none';
  protected?: boolean;
}

/**
 * Build routes dynamically from enabled features
 * Neutralized: returns empty array
 */
export const buildFeatureRoutes = (
  featureRoutes: Record<string, FeatureRoute[]>,
  enabledFeatures: string[]
): any[] => {
  return [];
};

/**
 * Import and return routes from a feature module
 * Neutralized: returns empty array
 */
export const importFeatureRoutes = async (
  featureName: string
): Promise<FeatureRoute[]> => {
  return [];
};

/**
 * Check if a route should be protected (requires auth)
 */
export const isProtectedRoute = (path: string, protectedRoutes: string[] = []): boolean => {
  return protectedRoutes.some(route => {
    // Exact match or starts with pattern
    return path === route || path.startsWith(route + '/');
  });
};
