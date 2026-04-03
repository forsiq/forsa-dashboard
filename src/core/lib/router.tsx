import { RouteObject } from 'react-router-dom';

export interface FeatureRoute {
  path: string;
  element: React.ReactElement;
  children?: FeatureRoute[];
  layout?: 'auth' | 'dashboard' | 'none';
  protected?: boolean;
}

/**
 * Build routes dynamically from enabled features
 * Each feature exports a `routes` array that gets merged into the main router
 */
export const buildFeatureRoutes = (
  featureRoutes: Record<string, FeatureRoute[]>,
  enabledFeatures: string[]
): RouteObject[] => {
  const routes: RouteObject[] = [];

  for (const [featureName, featureRoutesList] of Object.entries(featureRoutes)) {
    if (!enabledFeatures.includes(featureName)) continue;

    for (const route of featureRoutesList) {
      routes.push(convertRouteObject(route));
    }
  }

  return routes;
};

const convertRouteObject = (route: FeatureRoute): RouteObject => {
  const routeObj: RouteObject = {
    path: route.path,
    element: route.element,
  };

  if (route.children) {
    routeObj.children = route.children.map(convertRouteObject);
  }

  return routeObj;
};

/**
 * Import and return routes from a feature module
 * Features should export a `routes` array
 */
export const importFeatureRoutes = async (
  featureName: string
): Promise<FeatureRoute[]> => {
  try {
    const module = await import(/* @vite-ignore */ `@features/${featureName}/routes`);
    return module.routes || [];
  } catch (error) {
    console.warn(`Failed to load routes for feature "${featureName}":`, error);
    return [];
  }
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
