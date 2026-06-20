import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';

interface PageTransitionProps {
  children: React.ReactNode;
}

type Phase = 'idle' | 'exiting' | 'entering';

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      globalThis.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleStart = (url: string) => {
      if (url === router.asPath) return;
      // Skip exit animation: fading the wrapper while Next.js swaps page content
      // races portal teardown and triggers removeChild NotFoundError (React 19).
      clearTimeout();
      setPhase('idle');
    };

    const handleComplete = () => {
      clearTimeout();
      setPhase('entering');
      timeoutRef.current = globalThis.setTimeout(() => {
        setPhase('idle');
      }, 160);
    };

    const handleError = () => {
      clearTimeout();
      setPhase('idle');
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
      clearTimeout();
    };
  }, [router.events, router.asPath, clearTimeout]);

  const className =
    phase === 'exiting'
      ? 'page-transition-exit'
      : phase === 'entering'
        ? 'page-transition-enter-active'
        : 'page-transition-idle';

  return (
    <div className={className}>
      {children}
    </div>
  );
};
