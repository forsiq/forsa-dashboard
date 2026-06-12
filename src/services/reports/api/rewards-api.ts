import axios from 'axios';
import { API_BASE_URL } from '@config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Project-ID'] = '11';
  }
  return config;
});

export interface RewardTierStats {
  tier: string;
  count: string;
}

export interface TopUserByPoints {
  userUuid: string;
  phone: string;
  bonusPoints: string;
  totalPoints: string;
}

export interface RewardsAdminStats {
  totalClaims: number;
  todayClaims: number;
  totalBonusPoints: number;
  tierDistribution: RewardTierStats[];
  topUsers: TopUserByPoints[];
}

export async function fetchRewardsAdminStats(): Promise<RewardsAdminStats> {
  const { data } = await api.get('/rewards/admin/stats');
  return data.data;
}
