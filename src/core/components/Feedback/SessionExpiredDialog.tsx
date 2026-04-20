import React, { useEffect, useState, useCallback } from 'react';
import { LogIn } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { AmberConfirmModal } from './AmberConfirmModal';
import { onSessionExpired } from '../../lib/session/sessionEvents';

/**
 * SessionExpiredDialog
 *
 * Shows a modal asking the user to re-login when their session expires.
 * Triggered by the API interceptor via sessionEvents.
 * Place once at the app root level (_app.tsx).
 */
export const SessionExpiredDialog: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      setIsOpen(true);
    });
    return unsubscribe;
  }, []);

  const handleLogin = useCallback(() => {
    setIsOpen(false);
    const currentPath = window.location.pathname + window.location.search;
    const returnUrl = encodeURIComponent(currentPath);
    window.location.href = `/login?expired=true&from=${returnUrl}`;
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AmberConfirmModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleLogin}
      title={t('auth.session_expired') || 'انتهت صلاحية الجلسة'}
      message={t('auth.session_expired_desc') || 'جلستك الحالية منتهية الصلاحية. يرجى تسجيل الدخول مرة أخرى للمتابعة.'}
      confirmText={t('auth.login_again') || 'تسجيل الدخول'}
      variant="warning"
    />
  );
};

export default SessionExpiredDialog;
