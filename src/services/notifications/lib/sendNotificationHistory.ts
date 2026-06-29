import type { NotificationType } from '../types';

export const SEND_NOTIFICATION_HISTORY_KEY = 'forsa_send_notification_history';
export const MAX_SEND_NOTIFICATION_HISTORY = 20;

export interface SendNotificationHistoryTarget {
  id: string;
  label: string;
  sub?: string;
}

export interface SendNotificationHistoryEntry {
  id: string;
  sentAt: string;
  targets: SendNotificationHistoryTarget[];
  title: string;
  body: string;
  type: NotificationType;
  orderId?: string;
  sendPush: boolean;
}

export function readSendNotificationHistory(): SendNotificationHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEND_NOTIFICATION_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendSendNotificationHistory(
  entry: Omit<SendNotificationHistoryEntry, 'id' | 'sentAt'>,
): SendNotificationHistoryEntry[] {
  const next: SendNotificationHistoryEntry = {
    ...entry,
    id: `${Date.now()}`,
    sentAt: new Date().toISOString(),
  };
  const updated = [next, ...readSendNotificationHistory()].slice(
    0,
    MAX_SEND_NOTIFICATION_HISTORY,
  );
  try {
    localStorage.setItem(SEND_NOTIFICATION_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // ignore quota errors
  }
  return updated;
}
