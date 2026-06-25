/** Notification types — mirror auction-service notification.entity.ts */

export type NotificationType =
  | 'order_update'
  | 'auction_update'
  | 'deal_update'
  | 'admin_message'
  | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any> | null;
  isRead: boolean;
  readAt: string | null;
  senderId: string | null;
  orderId: number | null;
  pushSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  unread?: boolean;
  type?: NotificationType;
}

export interface NotificationsResponse {
  data: AppNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  unreadCount: number;
}

export interface SendNotificationInput {
  targetUserId: string;
  title: string;
  body: string;
  type?: NotificationType;
  titleAr?: string;
  bodyAr?: string;
  data?: Record<string, any>;
  orderId?: number;
  sendPush?: boolean;
}

export interface OrderStatusLog {
  id: string;
  orderId: number;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string | null;
  notes: string | null;
  auctionId: number | null;
  auctionTitle: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SendNotificationResult {
  notification: AppNotification;
  pushSent: boolean;
}
