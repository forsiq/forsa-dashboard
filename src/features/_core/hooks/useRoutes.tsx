import { useMemo } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useFeatureConfig } from './useFeatureConfig';

// Import core pages
import { NotFoundPage } from '../pages/NotFoundPage';
import { ServerErrorPage } from '../pages/ServerErrorPage';
import { NetworkErrorPage } from '../pages/NetworkErrorPage';
import { AppShell } from '../components/AppShell';
import { AuthGuard } from '../components/AuthGuard';

// Import layout
import { AmberAuthLayout } from '@core/layout/AmberAuthLayout';

// Dynamic imports for features
const lazyLoad = (importFn: () => Promise<{ default: React.ComponentType }>) => {
  return React.lazy(importFn);
};

/**
 * Build router dynamically based on enabled features
 */
export const useAppRouter = () => {
  const { enabledFeatures } = useFeatureConfig();

  const router = useMemo(() => {
    const routes: any[] = [
      // Root redirect
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />
      },
      // Error pages (outside shell)
      {
        path: '/error/500',
        element: <ServerErrorPage />
      },
      {
        path: '/error/network',
        element: <NetworkErrorPage />
      },
    ];

    // Auth routes (if enabled)
    if (enabledFeatures.includes('auth')) {
      routes.push(
        {
          path: '/login',
          element: (
            <AmberAuthLayout>
              {/* Lazy load auth pages */}
              <React.Suspense fallback={<div>Loading...</div>}>
                {/* Auth pages will be loaded here */}
                <div className="text-center">Auth Feature Enabled</div>
              </React.Suspense>
            </AmberAuthLayout>
          )
        }
      );
    }

    // Protected routes (with AppShell)
    const protectedRoutes: any[] = [];

    // Dashboard routes
    if (enabledFeatures.includes('dashboard')) {
      protectedRoutes.push({
        path: '/dashboard',
        element: <div className="text-center">Dashboard Feature Enabled</div>
      });
    }

    // Settings routes
    if (enabledFeatures.includes('settings')) {
      protectedRoutes.push({
        path: '/settings',
        element: <div className="text-center">Settings Feature Enabled</div>
      });
    }

    // Example routes
    if (enabledFeatures.includes('_example')) {
      protectedRoutes.push({
        path: '/example',
        element: <div className="text-center">Example Feature Enabled</div>
      });
    }

    routes.push({
      element: (
        <AuthGuard>
          <AppShell />
        </AuthGuard>
      ),
      children: protectedRoutes
    });

    // 404 catchall
    routes.push({
      path: '*',
      element: <NotFoundPage />
    });

    return createBrowserRouter(routes);
  }, [enabledFeatures]);

  return router;
};

// Import React for lazy loading
import React from 'react';
