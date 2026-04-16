/**
 * useFeatureConfig Hook
 *
 * A convenience hook that re-exports the FeatureContext for use in features.
 * This is the primary way features should access the configuration.
 *
 * @example
 * ```tsx
 * import { useFeatureConfig } from '@features/_core/hooks/useFeatureConfig';
 *
 * export const MyFeaturePage = () => {
 *   const { config, isFeatureEnabled } = useFeatureConfig();
 *
 *   if (!isFeatureEnabled('my-feature')) {
 *     return <div>Feature not enabled</div>;
 *   }
 *
 *   return <div>My Feature Content</div>;
 * };
 * ```
 */

// Re-export from core context
export { useFeatureConfig } from '@core/contexts/FeatureContext';
export type { AppConfig, FeatureConfig, FeatureConfigs } from '@core/contexts/FeatureContext';
