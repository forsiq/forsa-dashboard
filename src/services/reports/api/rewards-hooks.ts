import { useQuery } from '@tanstack/react-query';
import { fetchRewardsAdminStats } from './rewards-api';

export function useRewardsStats() {
  return useQuery({
    queryKey: ['rewards', 'admin', 'stats'],
    queryFn: fetchRewardsAdminStats,
    refetchInterval: 60000,
  });
}
