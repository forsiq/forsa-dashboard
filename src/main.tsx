import React, { Suspense, useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider, useNavigate, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Core Providers
import { FeatureProvider, useFeatureConfig } from '@core/contexts/FeatureContext';
import { LanguageProvider } from '@core/contexts/LanguageContext';
import { ThemeProvider } from '@core/contexts/ThemeContext';
import { NavigationProvider } from '@core/contexts/NavigationContext';
import { ProjectProvider } from '@core/contexts/ProjectContext';

// Core Pages (always available)
import { NotFoundPage } from '@features/_core/pages/NotFoundPage';
import { AppShell } from '@features/_core/components/AppShell';
import { AuthGuard } from '@features/_core/components/AuthGuard';
import { AboutPage } from '@core/pages/AboutPage';
import { PortalPage } from '@core/pages/PortalPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 }
  }
});

const RootRedirect: React.FC = () => {
  const { enabledFeatures } = useFeatureConfig();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (enabledFeatures.includes('dashboard')) {
      navigate('/dashboard', { replace: true });
    } else if (enabledFeatures.includes('auth')) {
      navigate('/login', { replace: true });
    }
  }, [enabledFeatures, navigate]);

  return null;
};

const AppRouter: React.FC = () => {
  const { enabledFeatures } = useFeatureConfig();
  const [dynamicRoutes, setDynamicRoutes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllRoutes = async () => {
      const routes: any[] = [];

      // Define feature imports with their paths
      const featureImports = [
        { name: 'auth', path: '@features/auth/routes', enabled: enabledFeatures.includes('auth'), isPublic: true },
        { name: 'dashboard', path: '@features/dashboard/routes', enabled: enabledFeatures.includes('dashboard') },
        { name: 'settings', path: '@features/settings/routes', enabled: enabledFeatures.includes('settings') },
        // Auction features
        { name: 'auctions', path: '@features/auctions/routes', enabled: enabledFeatures.includes('auctions') },
        { name: 'bidding', path: '@features/bidding/routes', enabled: enabledFeatures.includes('bidding') },
        { name: 'items', path: '@features/items/routes', enabled: enabledFeatures.includes('items') },
        { name: 'sales', path: '@features/sales/routes', enabled: enabledFeatures.includes('sales') },
        // Service features
        { name: 'inventory', path: '@services/inventory/routes', enabled: enabledFeatures.includes('inventory') },
        { name: 'orders', path: '@services/orders/routes', enabled: enabledFeatures.includes('orders') },
        { name: 'categories', path: '@services/categories/routes', enabled: enabledFeatures.includes('categories') },
        { name: 'customers', path: '@services/customers/routes', enabled: enabledFeatures.includes('customers') },
        { name: 'reports', path: '@services/reports/routes', enabled: enabledFeatures.includes('reports') },
      ];

      // Mapping of feature loaders to ensure Vite can analyze and bundle them correctly
      const loaders: Record<string, () => Promise<any>> = {
        'auth': () => import('@features/auth/routes'),
        'dashboard': () => import('@features/dashboard/routes'),
        'settings': () => import('@features/settings/routes'),
        'auctions': () => import('@features/auctions/routes'),
        'bidding': () => import('@features/bidding/routes'),
        'items': () => import('@features/items/routes'),
        'sales': () => import('@features/sales/routes'),
        'inventory': () => import('@services/inventory/routes'),
        'orders': () => import('@services/orders/routes'),
        'categories': () => import('@services/categories/routes'),
        'customers': () => import('@services/customers/routes'),
        'reports': () => import('@services/reports/routes'),
      };

      // Load only enabled features
      for (const feature of featureImports) {
        if (feature.enabled) {
          try {
            const loader = loaders[feature.name];
            if (loader) {
              const module = await loader();
              const featureRoutes = module.default || module[`${feature.name}Routes`] || [];
              routes.push(...featureRoutes);
            }
          } catch (error) {
            console.warn(`Feature "${feature.name}" could not be loaded, skipping...`, error);
          }
        }
      }

      setDynamicRoutes(routes);
      setIsLoading(false);
    };

    loadAllRoutes();
  }, [enabledFeatures]);

  const router = useMemo(() => {
    if (isLoading) {
      // Return minimal router while loading
      return createBrowserRouter([
        { path: '/', element: <div className="flex items-center justify-center min-h-screen text-zinc-muted font-bold font-mono animate-pulse">INITIALIZING...</div> },
        { path: '*', element: <NotFoundPage /> }
      ]);
    }

    const routes: any[] = [
      { path: '/', element: <RootRedirect /> },
    ];

    // Separate public and protected routes
    const publicRoutes: any[] = [];
    const protectedRoutes: any[] = [];

    dynamicRoutes.forEach(route => {
      // Auth routes are public
      if (route.path === '/login' || route.path === '/register' || route.path === '/otp') {
        publicRoutes.push(route);
      } else {
        protectedRoutes.push(route);
      }
    });

    routes.push(...publicRoutes);

    // Add core public routes
    routes.push(
      { path: '/about', element: <AboutPage /> },
      { path: '/portal', element: <PortalPage /> }
    );

    // Protected routes wrapper
    protectedRoutes.push(
      { path: '/about', element: <AboutPage /> },
      { path: '/portal', element: <PortalPage /> }
    );

    routes.push({
      element: (
        <AuthGuard>
          <AppShell />
        </AuthGuard>
      ),
      children: protectedRoutes
    });

    routes.push({
      path: '*',
      element: <NotFoundPage />
    });

    return createBrowserRouter(routes);
  }, [dynamicRoutes, isLoading, enabledFeatures]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-obsidian-outer">
        <div className="text-center">
          <div className="text-zinc-text font-black font-mono text-2xl mb-4 tracking-tighter">ZONEVAST</div>
          <div className="text-zinc-muted font-mono animate-pulse">INITIALIZING...</div>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <FeatureProvider configPath="/zvs.config.json">
        <LanguageProvider>
          <ThemeProvider>
            <NavigationProvider>
              <ProjectProvider>
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-zinc-muted font-bold font-mono animate-pulse">BOOTING SYSTEM...</div>}>
                  <AppRouter />
                </Suspense>
              </ProjectProvider>
            </NavigationProvider>
          </ThemeProvider>
        </LanguageProvider>
      </FeatureProvider>
    </QueryClientProvider>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}
