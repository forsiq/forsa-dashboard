import { useState, useEffect } from 'react';
import { StatCard, ActivityItem, QuickAction } from '../types';

export const useDashboardData = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    // Mock data for demonstration
    setTimeout(() => {
      setStats([
        {
          id: '1',
          title: 'Total Users',
          value: '2,543',
          change: 12,
          color: 'brand'
        },
        {
          id: '2',
          title: 'Active Sessions',
          value: '1,234',
          change: 8,
          color: 'success'
        },
        {
          id: '3',
          title: 'Revenue',
          value: '$45,678',
          change: -3,
          color: 'warning'
        },
        {
          id: '4',
          title: 'Conversion Rate',
          value: '3.2%',
          change: 0.5,
          color: 'info'
        }
      ]);

      setActivities([
        {
          id: '1',
          type: 'success',
          title: 'New user registered',
          description: 'John Doe created an account',
          timestamp: '2 minutes ago'
        },
        {
          id: '2',
          type: 'info',
          title: 'System update completed',
          description: 'Version 2.5.0 deployed successfully',
          timestamp: '1 hour ago'
        },
        {
          id: '3',
          type: 'warning',
          title: 'High server load detected',
          description: 'CPU usage at 85%',
          timestamp: '3 hours ago'
        }
      ]);

      setIsLoading(false);
    }, 500);
  }, []);

  return { stats, activities, isLoading };
};
