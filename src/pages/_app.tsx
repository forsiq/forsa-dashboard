import React, { Suspense } from 'react';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FeatureProvider } from '@core/contexts/FeatureContext';
import { LanguageProvider } from '@core/contexts/LanguageContext';
import { ThemeProvider } from '@core/contexts/ThemeContext';
import { NavigationProvider } from '@core/contexts/NavigationContext';
import { ProjectProvider } from '@core/contexts/ProjectContext';
import { ToastProvider } from '@core/contexts/ToastContext';
import { CoreUIProvider } from '@core/contexts/CoreUIConfigContext';
import { Toast } from '@core/components/Feedback/Toast';
import { SessionExpiredDialog } from '@core/components/Feedback/SessionExpiredDialog';
import { AuthGuard } from '@features/_core/components/AuthGuard';
import { AmberDashboardLayout } from '@core/layout/AmberDashboardLayout';
import { getSidebarForPath } from '@config/sidebarLoader';
import { useRouter } from 'next/router';
import { appTranslations } from '../translations';
import '@styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    }
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Public routes that don't need AuthGuard or Layout
  const isPublicRoute = ['/login', '/register', '/otp', '/404'].includes(router.pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <CoreUIProvider config={{
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
        authRefreshPath: '/api/v1/auth/auth/token/refresh/',
      }}>
      <FeatureProvider configPath="/zvs.config.json">
        <ToastProvider>
          <LanguageProvider extraTranslations={appTranslations}>
            <ThemeProvider>
              <NavigationProvider>
                <ProjectProvider>
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-zinc-muted font-bold font-mono animate-pulse">...</div>}>
                    <Toast />
                    <SessionExpiredDialog />
                    {isPublicRoute ? (
                      <Component {...pageProps} />
                    ) : (
                      <AuthGuard>
                        <AmberDashboardLayout sidebarLoader={getSidebarForPath}>
                          <Component {...pageProps} />
                        </AmberDashboardLayout>
                      </AuthGuard>
                    )}
                  </Suspense>
                </ProjectProvider>
              </NavigationProvider>
            </ThemeProvider>
          </LanguageProvider>
        </ToastProvider>
      </FeatureProvider>
      </CoreUIProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
