import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@core/query/queryClient';
import { RouteProgressProvider, RouteProgressBar } from '@core/navigation';
import { FeatureProvider } from '@core/contexts/FeatureContext';
import { LanguageProvider } from '@core/contexts/LanguageContext';
import { ThemeProvider } from '@core/contexts/ThemeContext';
import { NavigationProvider } from '@core/contexts/NavigationContext';
import { ProjectProvider } from '@core/contexts/ProjectContext';
import { ToastProvider } from '@core/contexts/ToastContext';
import { CoreUIProvider } from '@core/contexts/CoreUIConfigContext';
import { TimerProvider } from '@core/contexts/TimerContext';
import { Toast } from '@core/components/Feedback/Toast';
import { SessionExpiredDialog } from '@core/components/Feedback/SessionExpiredDialog';
import { clearViewportBlockers } from '@core/lib/utils/clearViewportBlockers';
import { AuthGuard } from '@core/core/components/AuthGuard';
import { ProjectGuard } from '@core/components/ProjectGuard';
import { PageTransition } from '@core/components/PageTransition';
import { ForsaDashboardLayout } from '../layout/ForsaDashboardLayout';
import { useRouter } from 'next/router';
import { appTranslations } from '../translations';
import '@styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const isPublicRoute = ['/login', '/register', '/otp', '/forgot-password', '/404'].includes(router.pathname);

  // Clear stuck modal layers when navigating to auth pages (logout uses Topbar clearAuthCookies)
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (url === '/login' || url.startsWith('/login?')) {
        clearViewportBlockers();
      }
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router.events]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouteProgressProvider>
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
                    <TimerProvider>
                    <Toast />
                    {!isPublicRoute && <SessionExpiredDialog />}
                    <RouteProgressBar />
                    {isPublicRoute ? (
                      <PageTransition>
                        <Component {...pageProps} />
                      </PageTransition>
                    ) : (
                      <AuthGuard>
                        <ProjectGuard>
                          <ForsaDashboardLayout>
                            <PageTransition>
                              <Component {...pageProps} />
                            </PageTransition>
                          </ForsaDashboardLayout>
                        </ProjectGuard>
                      </AuthGuard>
                    )}
                    </TimerProvider>
                  </ProjectProvider>
                </NavigationProvider>
              </ThemeProvider>
            </LanguageProvider>
          </ToastProvider>
        </FeatureProvider>
        </CoreUIProvider>
      </RouteProgressProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
