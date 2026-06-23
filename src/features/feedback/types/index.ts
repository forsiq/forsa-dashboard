export interface Review {
  id: number;
  itemId: number;
  itemType: string;
  userId?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  projectId: number;
  guestEmail?: string;
  guestName?: string;
  isGuest?: boolean;
  source?: 'authenticated' | 'email_guest';
  createdAt: string;
  updatedAt: string;
}

export interface GuestReviewPayload {
  itemId: number;
  itemType: string;
  rating: number;
  title?: string;
  comment?: string;
  guestEmail: string;
  guestName?: string;
}

export interface Comment {
  id: number;
  entityType: string;
  entityId: number;
  userId: string;
  parentId?: number;
  content: string;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: number;
  userId: string;
  itemId: number;
  itemType: string;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackPost {
  id: number;
  title: string;
  description: string;
  category: 'bug' | 'feature' | 'improvement' | 'other';
  status: 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined';
  userId: string;
  votesCount: number;
  commentsCount: number;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapItem {
  id: number;
  title: string;
  description?: string;
  category?: string;
  status: 'planned' | 'in_progress' | 'completed';
  sortOrder: number;
  targetDate?: string;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChangelogEntry {
  id: number;
  title: string;
  content: string;
  version?: string;
  type: 'feature' | 'fix' | 'improvement' | 'breaking';
  date: string;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackStats {
  reviews: {
    total: number;
    averageRating: number;
    pending: number;
  };
  posts: {
    total: number;
    pending: number;
  };
}

export interface ReviewStats {
  itemType: string;
  itemId: number;
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

export interface FeedbackFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  sort?: string;
  itemType?: string;
  itemId?: number;
  source?: string;
  isGuest?: boolean;
}
