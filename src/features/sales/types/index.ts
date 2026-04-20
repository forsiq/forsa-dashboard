/**
 * Group Buying Types
 */

export interface GroupBuying {
  id: string;
  title: string;
  description?: string;
  slug?: string;
  productId?: number;
  categoryId?: string;
  originalPrice: number;
  dealPrice: number;
  minParticipants: number;
  maxParticipants: number;
  currentParticipants: number;
  startTime: string;
  endTime: string;
  status: 'draft' | 'scheduled' | 'active' | 'unlocked' | 'completed' | 'cancelled' | 'expired';
  isUnlocked: boolean;
  autoCreateOrder: boolean;
  projectId?: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    nameAr?: string;
    slug?: string;
  };
  item?: {
    id: number;
    title: string;
    description?: string;
    images?: string[];
  };
}

export interface GroupBuyingCreateInput {
  title: string;
  description?: string;
  slug?: string;
  categoryId?: string;
  originalPrice: number;
  dealPrice: number;
  minParticipants: number;
  maxParticipants: number;
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  autoCreateOrder?: boolean;
  mainAttachmentId?: number;
  attachmentIds?: number[];
}

export interface GroupBuyingUpdateInput extends Partial<GroupBuyingCreateInput> {
  id: string;
}

export interface GroupBuyingFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: GroupBuying['status'] | 'all';
  categoryId?: string | 'all';
  sortBy?: 'title' | 'createdAt' | 'endTime' | 'currentParticipants';
  sortOrder?: 'asc' | 'desc';
}

export interface GroupBuyingsResponse {
  groupBuyings: GroupBuying[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GroupBuyingStats {
  activeCampaigns: number;
  completedCampaigns: number;
  totalParticipants: number;
  totalRevenue?: number;
}

export interface GroupBuyingParticipant {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  quantity: number;
  joinedAt: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface GroupBuyingParticipantsResponse {
  participants: GroupBuyingParticipant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
