'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AmberConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { onSessionExpired } from '@core/lib/session/sessionEvents';
import { clearViewportBlockers } from '@core/lib/utils/clearViewportBlockers';

const AUTH_PAGES = ['/login', '/register', '/otp', '/forgot-password'];

function isAuthPage(): boolean {
  if (typeof window === 'undefined') return false;
  return AUTH_PAGES.some((p) => window.location.pathname.startsWith(p));
}

/**
 * Session expired modal — uses local AmberConfirmModal (src/core) for layout fixes.
 */
export function SessionExpiredDialog() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      if (isAuthPage()) return;
      setIsOpen(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const closeOnNav = () => {
      setIsOpen(false);
      clearViewportBlockers();
    };
    router.events.on('routeChangeStart', closeOnNav);
    router.events.on('routeChangeComplete', closeOnNav);
    return () => {
      router.events.off('routeChangeStart', closeOnNav);
      router.events.off('routeChangeComplete', closeOnNav);
    };
  }, [router.events]);

  useEffect(() => {
    if (!isAuthPage()) return;
    setIsOpen(false);
    clearViewportBlockers();
  }, [router.pathname]);

  const handleLogin = useCallback(() => {
    setIsOpen(false);
    const currentPath = window.location.pathname + window.location.search;
    const returnUrl = encodeURIComponent(currentPath);
    window.location.href = `/login?expired=true&from=${returnUrl}`;
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  if (isAuthPage()) return null;

  return (
    <AmberConfirmModal
      isOpen={isOpen && !isAuthPage()}
      onClose={handleClose}
      onConfirm={handleLogin}
      title={t('auth.session_expired') || 'انتهت صلاحية الجلسة'}
      message={
        t('auth.session_expired_desc') ||
        'جلستك الحالية منتهية الصلاحية. يرجى تسجيل الدخول مرة أخرى للمتابعة.'
      }
      confirmText={t('auth.login_again') || 'تسجيل الدخول'}
      variant="warning"
    />
  );
}

export default SessionExpiredDialog;
