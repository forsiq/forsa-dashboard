import React, { ReactNode } from 'react';
import { useFeatureConfig } from '@core/contexts/FeatureContext';

interface FeatureGuardProps {
  /** Feature name(s) to check. All must be enabled if requireAll=true, otherwise any one is enough. */
  feature: string | string[];
  /** If true, all features must be enabled. Default: false (any one is enough) */
  requireAll?: boolean;
  /** Fallback to show when feature is disabled. Default: null */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * FeatureGuard - Conditionally renders children based on feature flags.
 *
 * Usage:
 * ```tsx
 * // Show only if "auctions" feature is enabled
 * <FeatureGuard feature="auctions">
 *   <AuctionsPage />
 * </FeatureGuard>
 *
 * // Show if ANY of the features is enabled
 * <FeatureGuard feature={["auctions", "group_buying"]}>
 *   <Content />
 * </FeatureGuard>
 *
 * // Show only if ALL features are enabled
 * <FeatureGuard feature={["auctions", "bidding"]} requireAll>
 *   <Content />
 * </FeatureGuard>
 *
 * // Show fallback when disabled
 * <FeatureGuard feature="premium" fallback={<UpgradePrompt />}>
 *   <PremiumContent />
 * </FeatureGuard>
 * ```
 */
export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  feature,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { isFeatureEnabled } = useFeatureConfig();

  const features = Array.isArray(feature) ? feature : [feature];

  const isAllowed = requireAll
    ? features.every((f) => isFeatureEnabled(f))
    : features.some((f) => isFeatureEnabled(f));

  return isAllowed ? <>{children}</> : <>{fallback}</>;
};
