import { useMemo } from 'react';
import Cookies from 'js-cookie';
import { extractDashboardRoleFromToken } from '@core/auth/dashboardRole';
import type { UserRole } from '@features/auth/types';

export interface DashboardRoleResult {
  role: UserRole;
  isMerchant: boolean;
  isAdmin: boolean;
}

export function useDashboardRole(): DashboardRoleResult {
  const role = useMemo<UserRole>(() => {
    if (typeof window === 'undefined') return 'admin';
    return extractDashboardRoleFromToken(Cookies.get('access'));
  }, []);

  return {
    role,
    isMerchant: role === 'merchant',
    isAdmin: role === 'admin',
  };
}
