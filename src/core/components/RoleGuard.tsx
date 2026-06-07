'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { useToast } from '@core/contexts/ToastContext';
import { useLanguage } from '@core/contexts/LanguageContext';
import type { UserRole } from '@features/auth/types';
import {
  decodeJwtPayload,
  extractDashboardRole,
} from '@core/auth/dashboardRole';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles, fallback }) => {
  const router = useRouter();
  const { warning } = useToast();
  const { t } = useLanguage();
  const [isAllowed, setIsAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = Cookies.get('access');
    if (!token) {
      void router.replace('/login');
      return;
    }

    const payload = decodeJwtPayload(token);

    if (payload?.exp && payload.exp * 1000 < Date.now()) {
      void router.replace('/login');
      return;
    }

    const role = extractDashboardRole(payload);
    const allowed = allowedRoles.includes(role);
    setIsAllowed(allowed);
    setChecking(false);

    if (!allowed) {
      warning(t('toast.access_denied'));
    }
  }, [allowedRoles, router, warning, t]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAllowed) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-6 text-center">
        <p className="text-zinc-muted text-sm max-w-md">{t('toast.access_denied')}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export { decodeJwtPayload, extractDashboardRole as extractRole };
