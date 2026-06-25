/** Notifications API - Using REST */
import { createApiClient } from '@core/services/ApiClientFactory';
import { API_BASE_URL } from '@config/api';
import type {
  AppNotification,
  NotificationFilters,
  NotificationsResponse,
  SendNotificationInput,
  SendNotificationResult,
  OrderStatusLog,
} from '../types';

export const notificationBaseApi = createApiClient<
  AppNotification,
  SendNotificationInput,
  Partial<SendNotificationInput>,
  NotificationFilters
>({
  serviceName: 'notifications',
  endpoint: '/notifications',
  apiBaseUrl: API_BASE_URL,
});

const mapToNotification = (raw: any): AppNotification => ({
  id: String(raw.id ?? ''),
  userId: String(raw.userId ?? raw.user_id ?? ''),
  title: String(raw.title ?? ''),
  body: String(raw.body ?? ''),
  type: (raw.type ?? 'system') as AppNotification['type'],
  data: raw.data ?? null,
  isRead: Boolean(raw.isRead ?? raw.is_read ?? false),
  readAt: raw.readAt ?? raw.read_at ?? null,
  senderId: raw.senderId ?? raw.sender_id ?? null,
  orderId: raw.orderId ?? raw.order_id ?? null,
  pushSent: Boolean(raw.pushSent ?? raw.push_sent ?? false),
  createdAt: raw.createdAt ?? raw.created_at ?? '',
  updatedAt: raw.updatedAt ?? raw.updated_at ?? '',
});

const mapToStatusLog = (raw: any): OrderStatusLog => ({
  id: String(raw.id ?? ''),
  orderId: Number(raw.orderId ?? raw.order_id ?? 0),
  fromStatus: raw.fromStatus ?? raw.from_status ?? null,
  toStatus: raw.toStatus ?? raw.to_status ?? '',
  changedBy: raw.changedBy ?? raw.changed_by ?? null,
  notes: raw.notes ?? null,
  auctionId: raw.auctionId ?? raw.auction_id ?? null,
  auctionTitle: raw.auctionTitle ?? raw.auction_title ?? null,
  createdAt: raw.createdAt ?? raw.created_at ?? '',
  updatedAt: raw.updatedAt ?? raw.updated_at ?? '',
});

export async function getNotifications(
  filters: NotificationFilters = {},
  signal?: AbortSignal,
): Promise<NotificationsResponse> {
  const params: Record<string, any> = {};
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.unread) params.unread = true;
  if (filters.type) params.type = filters.type;

  const res = await notificationBaseApi.getInstance().get('/notifications', {
    params,
    signal,
  });

  const body = res.data as any;
  const items = (body.data || []).map(mapToNotification);
  const pagination = body.pagination || {
    page: filters.page || 1,
    limit: filters.limit || 20,
    total: body.data?.length || 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  };

  return {
    data: items,
    pagination,
    unreadCount: body.unreadCount ?? 0,
  };
}

export async function getUnreadCount(signal?: AbortSignal): Promise<number> {
  const res = await notificationBaseApi.getInstance().get('/notifications/unread-count', { signal });
  return Number(res.data?.count ?? 0);
}

export async function markAsRead(id: string): Promise<AppNotification> {
  const res = await notificationBaseApi.getInstance().patch(`/notifications/${id}/read`);
  return mapToNotification(res.data.data);
}

export async function markAllAsRead(): Promise<{ updated: number }> {
  const res = await notificationBaseApi.getInstance().patch('/notifications/read-all');
  return { updated: res.data?.updated ?? 0 };
}

export async function getOrderNotifications(orderId: string): Promise<AppNotification[]> {
  const res = await notificationBaseApi.getInstance().get(`/notifications/order/${orderId}`);
  const body = res.data as any;
  return (body.data || []).map(mapToNotification);
}

export async function getOrderStatusLogs(orderId: string): Promise<OrderStatusLog[]> {
  const res = await notificationBaseApi.getInstance().get(`/orders/${orderId}/status-logs`);
  const body = res.data as any;
  return (body.data || []).map(mapToStatusLog);
}

export async function sendNotification(
  input: SendNotificationInput,
): Promise<SendNotificationResult> {
  const res = await notificationBaseApi.getInstance().post('/notifications/send', input);
  return {
    notification: mapToNotification(res.data.data),
    pushSent: Boolean(res.data.pushSent),
  };
}

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: NotificationFilters) => [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
  order: (orderId: string) => [...notificationKeys.all, 'order', orderId] as const,
  orderLogs: (orderId: string) => ['orders', orderId, 'status-logs'] as const,
};
