'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { useToast } from '@core/contexts/ToastContext';
import type { UserRole, JwtPayload } from '@features/auth/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function extractRole(payload: JwtPayload): UserRole {
  if (payload.role) {
    const normalized = payload.role.toLowerCase();
    if (normalized === 'admin' || normalized === 'manager' || normalized === 'user') {
      return normalized as UserRole;
    }
  }
  if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
    const priority: UserRole[] = ['admin', 'manager', 'user'];
    for (const p of priority) {
      if (payload.roles.some(r => r.toLowerCase() === p)) {
        return p;
      }
    }
  }
  return 'user';
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles, fallback }) => {
  const router = useRouter();
  const { warning } = useToast();
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

    const role = payload ? extractRole(payload) : 'user';
    const allowed = allowedRoles.includes(role);
    setIsAllowed(allowed);
    setChecking(false);

    if (!allowed) {
      warning('Access denied. Insufficient permissions.');
      void router.replace('/dashboard');
    }
  }, [allowedRoles, router, warning]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAllowed) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

export { decodeJwtPayload, extractRole };
