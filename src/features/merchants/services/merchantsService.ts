import { createApiClient } from '@core/services/ApiClientFactory';
import { getWithListFilters, parseApiListBody } from '@core/services/serviceListFetch';
import { API_BASE_URL } from '@config/api';

const baseClient = createApiClient({
  serviceName: 'merchants',
  endpoint: '/merchants',
  apiBaseUrl: API_BASE_URL,
});

export interface Merchant {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'active' | 'inactive' | 'suspended';
  productsCount: number;
  auctionsCount: number;
  joinedAt: string;
  avatar?: string | null;
}

export interface MerchantDetail extends Merchant {
  totalRevenue: number;
  address?: string;
}

export interface MerchantProduct {
  id: number;
  title: string;
  price: number;
  status: string;
  category: string;
  imageUrl?: string | null;
  createdAt: string;
}

export interface MerchantAuction {
  id: number;
  title: string;
  startPrice: number;
  currentPrice: number;
  status: string;
  imageUrl?: string | null;
  endTime: string;
  bidCount: number;
}

export interface MerchantsResponse {
  data: Merchant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MerchantFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

type MerchantApiRow = Record<string, unknown>;

function shortIdLabel(id: string): string {
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}

function deriveMerchantStatus(raw: MerchantApiRow): Merchant['status'] {
  const explicit = raw.status ?? raw.account_status;
  if (typeof explicit === 'string' && explicit.trim()) {
    const s = explicit.trim().toLowerCase();
    if (s === 'active' || s === 'inactive' || s === 'suspended') return s;
  }
  const activeAuctions = Number(
    raw.activeAuctionCount ?? raw.active_auction_count ?? 0,
  );
  return activeAuctions > 0 ? 'active' : 'inactive';
}

function mapMerchantFromApi(raw: MerchantApiRow): Merchant {
  const id = String(raw.id ?? '');
  const nameRaw =
    raw.name ??
    raw.full_name ??
    raw.fullName ??
    [raw.firstName ?? raw.first_name, raw.lastName ?? raw.last_name]
      .filter((p) => typeof p === 'string' && p.trim())
      .join(' ')
      .trim() ||
    undefined;
  const phoneRaw = raw.phone ?? raw.phone_number ?? raw.mobile;

  return {
    id,
    name:
      (typeof nameRaw === 'string' && nameRaw.trim()) ||
      shortIdLabel(id) ||
      '—',
    phone: (typeof phoneRaw === 'string' && phoneRaw.trim()) || '—',
    email: typeof raw.email === 'string' ? raw.email : undefined,
    status: deriveMerchantStatus(raw),
    productsCount: Number(
      raw.productsCount ?? raw.productCount ?? raw.product_count ?? 0,
    ),
    auctionsCount: Number(
      raw.auctionsCount ?? raw.auctionCount ?? raw.auction_count ?? 0,
    ),
    joinedAt: String(
      raw.joinedAt ?? raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    ),
    avatar: (raw.avatar as string | null | undefined) ?? null,
  };
}

function mapMerchantDetailFromApi(raw: MerchantApiRow): MerchantDetail {
  return {
    ...mapMerchantFromApi(raw),
    totalRevenue: Number(raw.totalRevenue ?? raw.total_revenue ?? 0),
    address: typeof raw.address === 'string' ? raw.address : undefined,
  };
}

function mapMerchantProductFromApi(raw: MerchantApiRow): MerchantProduct {
  const statusRaw =
    raw.status ??
    raw.approvalStatus ??
    raw.approval_status ??
    'draft';
  return {
    id: Number(raw.id ?? 0),
    title: String(raw.title ?? raw.name ?? '—'),
    price: Number(raw.price ?? raw.startPrice ?? raw.start_price ?? 0),
    status: String(statusRaw),
    category: String(raw.category ?? raw.category_name ?? '—'),
    imageUrl: (raw.imageUrl ?? raw.image_url ?? null) as string | null,
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
  };
}

function mapMerchantAuctionFromApi(raw: MerchantApiRow): MerchantAuction {
  return {
    id: Number(raw.id ?? 0),
    title: String(raw.title ?? '—'),
    startPrice: Number(raw.startPrice ?? raw.start_price ?? 0),
    currentPrice: Number(
      raw.currentPrice ?? raw.current_price ?? raw.finalPrice ?? raw.final_price ?? 0,
    ),
    status: String(raw.status ?? 'draft'),
    imageUrl: (raw.imageUrl ?? raw.image_url ?? null) as string | null,
    endTime: String(raw.endTime ?? raw.end_time ?? new Date().toISOString()),
    bidCount: Number(raw.bidCount ?? raw.bid_count ?? 0),
  };
}

export const merchantsService = {
  list: async (filters?: MerchantFilters, signal?: AbortSignal): Promise<MerchantsResponse> => {
    const axiosRes = await getWithListFilters(
      baseClient.getInstance(),
      '/merchants',
      filters as Record<string, unknown> | undefined,
      signal,
    );
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const parsed = parseApiListBody<MerchantApiRow>(axiosRes.data, { page, limit });
    return {
      data: parsed.items.map(mapMerchantFromApi),
      total: parsed.total,
      page: parsed.page,
      limit: parsed.limit,
      totalPages: parsed.totalPages,
    };
  },

  get: async (id: string): Promise<MerchantDetail> => {
    const client = baseClient.getInstance();
    const response = await client.get(`/merchants/${id}`);
    const raw = (response.data?.data ?? response.data) as MerchantApiRow;
    return mapMerchantDetailFromApi(raw);
  },

  getProducts: async (id: string, signal?: AbortSignal): Promise<MerchantProduct[]> => {
    const client = baseClient.getInstance();
    const response = await client.get(`/merchants/${id}/products`, { signal });
    return parseApiListBody<MerchantApiRow>(response.data).items.map(mapMerchantProductFromApi);
  },

  getAuctions: async (id: string, signal?: AbortSignal): Promise<MerchantAuction[]> => {
    const client = baseClient.getInstance();
    const response = await client.get(`/merchants/${id}/auctions`, { signal });
    return parseApiListBody<MerchantApiRow>(response.data).items.map(mapMerchantAuctionFromApi);
  },
};
