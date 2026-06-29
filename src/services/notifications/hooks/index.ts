/** Notifications Hooks */
import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { useMutationContext } from '@core/hooks/useMutationContext';
import * as api from '../api/notifications';
import type { NotificationFilters, SendNotificationInput } from '../types';

export const useListNotifications = (filters: NotificationFilters = {}) => {
  return useQuery({
    queryKey: api.notificationKeys.list(filters),
    queryFn: ({ signal }) => api.getNotifications(filters, signal),
    placeholderData: keepPreviousData,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: api.notificationKeys.unreadCount(),
    queryFn: ({ signal }) => api.getUnreadCount(signal),
    refetchInterval: (query) =>
      document.visibilityState === 'visible' ? 60_000 : false,
  });
};

export const useOrderNotifications = (orderId: string, enabled = true) => {
  return useQuery({
    queryKey: api.notificationKeys.order(orderId),
    queryFn: () => api.getOrderNotifications(orderId),
    enabled: enabled && !!orderId,
  });
};

export const useOrderStatusLogs = (orderId: string, enabled = true) => {
  return useQuery({
    queryKey: api.notificationKeys.orderLogs(orderId),
    queryFn: () => api.getOrderStatusLogs(orderId),
    enabled: enabled && !!orderId,
  });
};

export const useMarkAsRead = () => {
  const { queryClient, getErrorDetail, toast } = useMutationContext();
  return useMutation({
    mutationFn: (id: string) => api.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.notificationKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(getErrorDetail(error));
    },
  });
};

export const useMarkAllAsRead = () => {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();
  return useMutation({
    mutationFn: () => api.markAllAsRead(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: api.notificationKeys.all });
      toast.success(t('notifications.marked_all_read', { count: data.updated }));
    },
    onError: (error: unknown) => {
      toast.error(getErrorDetail(error));
    },
  });
};

export const useSendNotification = () => {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();
  return useMutation({
    mutationFn: (input: SendNotificationInput) => api.sendNotification(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: api.notificationKeys.all });
      toast.success(
        data.pushSent
          ? t('notifications.sent_with_push')
          : t('notifications.sent_no_push'),
      );
    },
    onError: (error: unknown) => {
      toast.error(getErrorDetail(error), 6000);
    },
  });
};

export interface BulkSendResult {
  succeeded: number;
  failed: number;
  total: number;
}

export const useSendBulkNotifications = () => {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();
  return useMutation({
    mutationFn: async (inputs: SendNotificationInput[]): Promise<BulkSendResult> => {
      if (inputs.length === 0) {
        return { succeeded: 0, failed: 0, total: 0 };
      }
      const results = await Promise.allSettled(
        inputs.map((input) => api.sendNotification(input)),
      );
      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.length - succeeded;
      if (succeeded === 0) {
        const firstError = results.find((r) => r.status === 'rejected') as
          | PromiseRejectedResult
          | undefined;
        throw firstError?.reason ?? new Error('Send failed');
      }
      return { succeeded, failed, total: results.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: api.notificationKeys.all });
      if (data.failed > 0) {
        toast.success(
          t('send_notification.sent_partial', {
            succeeded: data.succeeded,
            total: data.total,
          }),
        );
      } else if (data.total === 1) {
        toast.success(t('send_notification.success'));
      } else {
        toast.success(
          t('send_notification.sent_bulk', { count: data.succeeded }),
        );
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorDetail(error), 6000);
    },
  });
};
