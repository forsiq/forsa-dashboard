import type { UserRole } from '@features/auth/types';

/**
 * Forsa dashboard capabilities — aligned with RoleGuard routes and business_role matrix.
 * Use for buttons/actions; RoleGuard remains the route-level enforcement.
 */
export type DashboardCapability =
  | 'categories.view'
  | 'categories.manage'
  | 'categories.reorder'
  | 'categories.reviewSuggestions'
  | 'auctions.view'
  | 'auctions.manage'
  | 'groupBuying.view'
  | 'groupBuying.manage'
  | 'listings.manage'
  | 'listings.delete'
  | 'listings.viewApproval'
  | 'moderation.access';

const CAPABILITY_ROLES: Record<DashboardCapability, readonly UserRole[]> = {
  'categories.view': ['admin', 'merchant', 'product_moderator'],
  'categories.manage': ['admin', 'merchant'],
  /** admin, merchant, trusted_merchant (JWT alias → merchant) — matches auction-service PATCH /categories/reorder */
  'categories.reorder': ['admin', 'merchant'],
  'categories.reviewSuggestions': ['admin', 'product_moderator'],
  'auctions.view': ['admin', 'merchant', 'product_analyst'],
  'auctions.manage': ['admin', 'merchant'],
  'groupBuying.view': ['admin', 'merchant', 'product_analyst'],
  'groupBuying.manage': ['admin', 'merchant'],
  'listings.manage': ['admin', 'merchant'],
  'listings.delete': ['admin'],
  'listings.viewApproval': ['admin'],
  'moderation.access': ['admin'],
};

export function hasDashboardCapability(
  role: UserRole,
  capability: DashboardCapability,
): boolean {
  return CAPABILITY_ROLES[capability].includes(role);
}
