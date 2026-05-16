import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { RouteProgressContext } from './RouteProgressContext';

export function RouteProgressProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const start = useCallback(() => setIsNavigating(true), []);
  const stop = useCallback(() => setIsNavigating(false), []);

  useEffect(() => {
    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', stop);
    router.events.on('routeChangeError', stop);

    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', stop);
      router.events.off('routeChangeError', stop);
    };
  }, [router.events, start, stop]);

  return (
    <RouteProgressContext.Provider value={{ isNavigating }}>
      {children}
    </RouteProgressContext.Provider>
  );
}
