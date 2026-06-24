import { createClient } from '@core/services/ApiClientFactory';
import { getApiOrigin } from '@config/api';
import type { GuestReviewPayload } from '../types';

/**
 * Feedback service client.
 *
 * Uses the shared core-ui axios factory so that Authorization, X-Project-ID,
 * Accept-Language and 401 token-refresh are handled automatically — the same
 * pattern as the merchants feature. The zv-feedback-service is mounted at
 * `${apiOrigin}/feedback/api/v1`.
 */
const FEEDBACK_BASE_URL = `${getApiOrigin()}/feedback/api/v1`;
const client = createClient(FEEDBACK_BASE_URL);

/** Unauthenticated client for public guest review submissions. */
function getGuestClient() {
  return createClient(FEEDBACK_BASE_URL);
}
const guestClient = getGuestClient();

// Reviews
export const reviewApi = {
  list: (params?: Record<string, string | number>) =>
    client.get('/reviews', { params }).then((r) => r.data),
  get: (id: number) =>
    client.get(`/reviews/${id}`).then((r) => r.data),
  getStats: (itemType: string, itemId: number) =>
    client.get(`/reviews/stats/${itemType}/${itemId}`).then((r) => r.data),
  approve: (id: number) =>
    client.put(`/admin/reviews/${id}/status?status=approved`).then((r) => r.data),
  reject: (id: number) =>
    client.put(`/admin/reviews/${id}/status?status=rejected`).then((r) => r.data),
  createGuest: (data: GuestReviewPayload) =>
    guestClient.post('/reviews', data).then((r) => r.data),
};

// Posts (Feature Requests)
export const postApi = {
  list: (params?: Record<string, string | number>) =>
    client.get('/posts', { params }).then((r) => r.data),
  get: (id: number) =>
    client.get(`/posts/${id}`).then((r) => r.data),
  create: (data: { title: string; description: string; category?: string }) =>
    client.post('/posts', data).then((r) => r.data),
  updateStatus: (id: number, status: string) =>
    client.put(`/admin/posts/${id}/status?status=${status}`).then((r) => r.data),
};

// Roadmap
export const roadmapApi = {
  list: () => client.get('/roadmap').then((r) => r.data),
  create: (data: Record<string, unknown>) =>
    client.post('/roadmap', data).then((r) => r.data),
  update: (id: number, data: Record<string, unknown>) =>
    client.put(`/roadmap/${id}`, data).then((r) => r.data),
  remove: (id: number) =>
    client.delete(`/roadmap/${id}`).then((r) => r.data),
};

// Changelog
export const changelogApi = {
  list: () => client.get('/changelog').then((r) => r.data),
  create: (data: Record<string, unknown>) =>
    client.post('/changelog', data).then((r) => r.data),
  update: (id: number, data: Record<string, unknown>) =>
    client.put(`/changelog/${id}`, data).then((r) => r.data),
  remove: (id: number) =>
    client.delete(`/changelog/${id}`).then((r) => r.data),
};

// Admin
export const adminApi = {
  getStats: () => client.get('/admin/stats').then((r) => r.data),
  listReviews: (params?: Record<string, string | number>) =>
    client.get('/admin/reviews', { params }).then((r) => r.data),
  listPosts: (params?: Record<string, string | number>) =>
    client.get('/admin/posts', { params }).then((r) => r.data),
};
