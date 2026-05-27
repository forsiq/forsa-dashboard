import React, { useEffect } from 'react';
import type { AppContext, AppProps } from 'next/app';
import type { Language } from '@yousef2001/core-ui';
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
import { PwaInstallProvider } from '@core/contexts/PwaInstallContext';
import { Toast } from '@core/components/Feedback/Toast';
import { SessionExpiredDialog } from '@core/components/Feedback/SessionExpiredDialog';
import { clearViewportBlockers } from '@core/lib/utils/clearViewportBlockers';
import { AuthGuard } from '@core/core/components/AuthGuard';
import { ProjectGuard } from '@core/components/ProjectGuard';
import { PageTransition } from '@core/components/PageTransition';
import { ForsaDashboardLayout } from '../layout/ForsaDashboardLayout';
import { useRouter } from 'next/router';
import { appTranslations } from '../translations';
import { resolveCookieDomain } from '../lib/api-config';
import { migrateAuthCookiesToSharedDomain } from '../lib/auth-cookies';
import '@styles/globals.css';

const LANGUAGE_COOKIE = 'zv_language';

function languageFromCookie(value: string | undefined): Language {
  if (value === 'ar' || value === 'ku' || value === 'en') return value;
  return 'en';
}

type ForsaAppProps = AppProps & {
  initialLanguage: Language;
};

function MyApp({ Component, pageProps, initialLanguage }: ForsaAppProps) {
  const router = useRouter();

  const isPublicRoute = ['/login', '/register', '/otp', '/forgot-password', '/404'].includes(router.pathname);

  useEffect(() => {
    migrateAuthCookiesToSharedDomain(resolveCookieDomain());
  }, []);

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
          apiBaseUrl:
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            'https://test.zonevast.com/forsa/api/v1',
          authRefreshPath: '/api/v1/auth/auth/token/refresh/',
          cookieDomain: resolveCookieDomain(),
        }}>
        <FeatureProvider configPath="/zvs.config.json">
          <LanguageProvider
            extraTranslations={appTranslations}
            initialLanguage={initialLanguage}
          >
            <ToastProvider>
              <ThemeProvider>
                <NavigationProvider>
                  <ProjectProvider>
                    <TimerProvider>
                    <PwaInstallProvider>
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
                    </PwaInstallProvider>
                    </TimerProvider>
                  </ProjectProvider>
                </NavigationProvider>
              </ThemeProvider>
            </ToastProvider>
          </LanguageProvider>
        </FeatureProvider>
        </CoreUIProvider>
      </RouteProgressProvider>
    </QueryClientProvider>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const pageCtx = appContext.ctx;
  const parent = appContext.Component.getInitialProps
    ? await appContext.Component.getInitialProps(pageCtx)
    : {};

  const reqWithCookies = pageCtx.req as
    | (typeof pageCtx.req & { cookies?: Record<string, string> })
    | undefined;
  const cookieLang = reqWithCookies?.cookies?.[LANGUAGE_COOKIE];
  const initialLanguage = languageFromCookie(
    typeof cookieLang === 'string' ? cookieLang : undefined,
  );

  return { ...parent, initialLanguage };
};

export default MyApp;
