import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi, postApi, roadmapApi, changelogApi, adminApi } from './feedback-api';
import type { FeedbackFilters, GuestReviewPayload, CreatePostPayload } from '../types';

export const feedbackKeys = {
  all: ['feedback'] as const,
  stats: () => [...feedbackKeys.all, 'stats'] as const,
  reviews: () => [...feedbackKeys.all, 'reviews'] as const,
  reviewsList: (filters: FeedbackFilters) => [...feedbackKeys.reviews(), 'list', filters] as const,
  reviewDetail: (id: number) => [...feedbackKeys.reviews(), 'detail', id] as const,
  reviewStats: (itemType: string, itemId: number) =>
    [...feedbackKeys.reviews(), 'stats', itemType, itemId] as const,
  posts: () => [...feedbackKeys.all, 'posts'] as const,
  postsList: (filters: FeedbackFilters) => [...feedbackKeys.posts(), 'list', filters] as const,
  postDetail: (id: number) => [...feedbackKeys.posts(), 'detail', id] as const,
  roadmap: () => [...feedbackKeys.all, 'roadmap'] as const,
  changelog: () => [...feedbackKeys.all, 'changelog'] as const,
  adminReviews: (filters: FeedbackFilters) =>
    [...feedbackKeys.all, 'admin', 'reviews', filters] as const,
  adminPosts: (filters: FeedbackFilters) =>
    [...feedbackKeys.all, 'admin', 'posts', filters] as const,
};

const noRetry = { retry: false, refetchOnWindowFocus: false };

export const useFeedbackStats = () =>
  useQuery({
    queryKey: feedbackKeys.stats(),
    queryFn: () => adminApi.getStats(),
    ...noRetry,
  });

export const useReviews = (filters: FeedbackFilters = {}) =>
  useQuery({
    queryKey: feedbackKeys.reviewsList(filters),
    queryFn: () => reviewApi.list(filters as Record<string, string | number>),
    ...noRetry,
  });

export const useReviewStats = (itemType: string, itemId: number) =>
  useQuery({
    queryKey: feedbackKeys.reviewStats(itemType, itemId),
    queryFn: () => reviewApi.getStats(itemType, itemId),
    ...noRetry,
  });

export const useApproveReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewApi.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: feedbackKeys.reviews() }),
  });
};

export const useRejectReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewApi.reject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: feedbackKeys.reviews() }),
  });
};

export const useCreateGuestReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GuestReviewPayload) => reviewApi.createGuest(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: feedbackKeys.reviews() }),
  });
};

export const usePosts = (filters: FeedbackFilters = {}) =>
  useQuery({
    queryKey: feedbackKeys.postsList(filters),
    queryFn: () => postApi.list(filters as Record<string, string | number>),
    ...noRetry,
  });

export const useUpdatePostStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      postApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: feedbackKeys.posts() }),
  });
};

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePostPayload) => postApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: feedbackKeys.posts() });
      qc.invalidateQueries({ queryKey: feedbackKeys.stats() });
    },
  });
};

export const useRoadmap = () =>
  useQuery({
    queryKey: feedbackKeys.roadmap(),
    queryFn: () => roadmapApi.list(),
    ...noRetry,
  });

export const useChangelog = () =>
  useQuery({
    queryKey: feedbackKeys.changelog(),
    queryFn: () => changelogApi.list(),
    ...noRetry,
  });

export const useAdminReviews = (filters: FeedbackFilters = {}) =>
  useQuery({
    queryKey: feedbackKeys.adminReviews(filters),
    queryFn: () => adminApi.listReviews(filters as Record<string, string | number>),
    ...noRetry,
  });

export const useAdminPosts = (filters: FeedbackFilters = {}) =>
  useQuery({
    queryKey: feedbackKeys.adminPosts(filters),
    queryFn: () => adminApi.listPosts(filters as Record<string, string | number>),
    ...noRetry,
  });
