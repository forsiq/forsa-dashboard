import { useMemo } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { extractDashboardRoleFromToken } from '@core/auth/dashboardRole';
import type { UserRole } from '@features/auth/types';

export interface DashboardRoleResult {
  role: UserRole;
  isMerchant: boolean;
  isAdmin: boolean;
}

export function useDashboardRole(): DashboardRoleResult {
  const router = useRouter();
  const role = useMemo<UserRole>(() => {
    if (typeof window === 'undefined') return 'customer_support';
    return extractDashboardRoleFromToken(Cookies.get('access'));
  }, [router.asPath, router.isReady]);

  return {
    role,
    isMerchant: role === 'merchant',
    isAdmin: role === 'admin',
  };
}
