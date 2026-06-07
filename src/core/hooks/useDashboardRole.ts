import { useMemo } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { extractDashboardRoleFromToken, isTrustedMerchantFromToken } from '@core/auth/dashboardRole';
import {
  hasDashboardCapability,
  type DashboardCapability,
} from '@core/auth/roleCapabilities';
import type { UserRole } from '@features/auth/types';

export interface DashboardRoleResult {
  role: UserRole;
  isMerchant: boolean;
  isTrustedMerchant: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  canManageCategories: boolean;
  canReviewCategorySuggestions: boolean;
  canManageAuctions: boolean;
  canManageGroupBuying: boolean;
  canManageListings: boolean;
  canDeleteListings: boolean;
  canViewApprovalStatus: boolean;
  can: (capability: DashboardCapability) => boolean;
}

export function useDashboardRole(): DashboardRoleResult {
  const router = useRouter();
  const role = useMemo<UserRole>(() => {
    if (typeof window === 'undefined') return 'customer_support';
    return extractDashboardRoleFromToken(Cookies.get('access'));
  }, [router.asPath, router.isReady]);

  const isTrustedMerchant = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return isTrustedMerchantFromToken(Cookies.get('access'));
  }, [router.asPath, router.isReady]);

  const can = useMemo(
    () => (capability: DashboardCapability) => hasDashboardCapability(role, capability),
    [role],
  );

  return {
    role,
    isMerchant: role === 'merchant',
    isTrustedMerchant,
    isAdmin: role === 'admin',
    isModerator: role === 'product_moderator',
    canManageCategories: can('categories.manage'),
    canReviewCategorySuggestions: can('categories.reviewSuggestions'),
    canManageAuctions: can('auctions.manage'),
    canManageGroupBuying: can('groupBuying.manage'),
    canManageListings: can('listings.manage'),
    canDeleteListings: can('listings.delete'),
    canViewApprovalStatus: can('listings.viewApproval'),
    can,
  };
}
