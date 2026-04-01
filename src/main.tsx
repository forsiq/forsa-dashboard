import React, { Suspense, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider, useNavigate, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Core Providers
import { FeatureProvider, useFeatureConfig } from '@core/contexts/FeatureContext';
import { LanguageProvider } from '@core/contexts/LanguageContext';
import { ThemeProvider } from '@core/contexts/ThemeContext';
import { NavigationProvider } from '@core/contexts/NavigationContext';

// Feature Routes
import { authRoutes } from '@features/auth/routes';
import { dashboardRoutes } from '@features/dashboard/routes';
import { settingsRoutes } from '@features/settings/routes';
import { exampleRoutes } from '@features/_example/routes';

// Service Routes
import { inventoryRoutes } from '@services/inventory/routes';
import { ordersRoutes } from '@services/orders/routes';
import { categoriesRoutes } from '@services/categories/routes';
import { customersRoutes } from '@services/customers/routes';
import { reportsRoutes } from '@services/reports/routes';

// Core Pages
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

  const router = useMemo(() => {
    const routes: any[] = [
      { path: '/', element: <RootRedirect /> },
    ];

    if (enabledFeatures.includes('auth')) routes.push(...authRoutes);
    
    const protectedRoutes: any[] = [];
    if (enabledFeatures.includes('dashboard')) protectedRoutes.push(...dashboardRoutes);
    if (enabledFeatures.includes('settings')) protectedRoutes.push(...settingsRoutes);
    if (enabledFeatures.includes('inventory')) protectedRoutes.push(...inventoryRoutes);
    if (enabledFeatures.includes('orders')) protectedRoutes.push(...ordersRoutes);
    if (enabledFeatures.includes('categories')) protectedRoutes.push(...categoriesRoutes);
    if (enabledFeatures.includes('customers')) protectedRoutes.push(...customersRoutes);
    if (enabledFeatures.includes('reports')) protectedRoutes.push(...reportsRoutes);
    
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
  }, [enabledFeatures]);

  return <RouterProvider router={router} />;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <NavigationProvider>
            <FeatureProvider configPath="/zvs.config.json">
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-zinc-muted font-bold font-mono animate-pulse">BOOTING SYSTEM...</div>}>
                <AppRouter />
              </Suspense>
            </FeatureProvider>
          </NavigationProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}
