import { createApiClient } from '@core/services/ApiClientFactory';
import { getWithListFilters, parseApiListBody } from '@core/services/serviceListFetch';
import { API_BASE_URL } from '@config/api';

const baseClient = createApiClient({
  serviceName: 'merchant-applications',
  endpoint: '/admin/merchant-applications',
  apiBaseUrl: API_BASE_URL,
});

export type MerchantApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface MerchantApplication {
  id: number;
  userId: string;
  businessName: string;
  phone: string;
  email?: string | null;
  commercialRecord?: string | null;
  iban?: string | null;
  productCategories?: string | null;
  notes?: string | null;
  status: MerchantApplicationStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantApplicationsResponse {
  data: MerchantApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MerchantApplicationFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

type ApplicationApiRow = Record<string, unknown>;

function deriveApplicationStatus(raw: ApplicationApiRow): MerchantApplicationStatus {
  const explicit = raw.status;
  if (typeof explicit === 'string') {
    const s = explicit.trim().toLowerCase();
    if (s === 'pending' || s === 'approved' || s === 'rejected') return s;
  }
  return 'pending';
}

function optionalString(raw: unknown): string | null {
  if (typeof raw === 'string' && raw.trim()) return raw;
  return null;
}

export function mapApplicationFromApi(raw: ApplicationApiRow): MerchantApplication {
  return {
    id: Number(raw.id ?? 0),
    userId: String(raw.userId ?? raw.user_id ?? raw.userUuid ?? raw.user_uuid ?? ''),
    businessName:
      (typeof raw.businessName === 'string' && raw.businessName.trim()) ||
      (typeof raw.business_name === 'string' && raw.business_name.trim()) ||
      '—',
    phone: (typeof raw.phone === 'string' && raw.phone.trim()) || '—',
    email: optionalString(raw.email),
    commercialRecord: optionalString(raw.commercialRecord ?? raw.commercial_record),
    iban: optionalString(raw.iban),
    productCategories: optionalString(raw.productCategories ?? raw.product_categories),
    notes: optionalString(raw.notes),
    status: deriveApplicationStatus(raw),
    reviewedBy: optionalString(raw.reviewedBy ?? raw.reviewed_by),
    reviewedAt: optionalString(raw.reviewedAt ?? raw.reviewed_at),
    rejectionReason: optionalString(raw.rejectionReason ?? raw.rejection_reason),
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? new Date().toISOString()),
  };
}

export const merchantApplicationsService = {
  list: async (
    filters?: MerchantApplicationFilters,
    signal?: AbortSignal,
  ): Promise<MerchantApplicationsResponse> => {
    const axiosRes = await getWithListFilters(
      baseClient.getInstance(),
      '/admin/merchant-applications',
      filters as Record<string, unknown> | undefined,
      signal,
    );
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const parsed = parseApiListBody<ApplicationApiRow>(axiosRes.data, { page, limit });
    return {
      data: parsed.items.map(mapApplicationFromApi),
      total: parsed.total,
      page: parsed.page,
      limit: parsed.limit,
      totalPages: parsed.totalPages,
    };
  },

  get: async (id: number | string): Promise<MerchantApplication> => {
    const client = baseClient.getInstance();
    const response = await client.get(`/admin/merchant-applications/${id}`);
    const raw = (response.data?.data ?? response.data) as ApplicationApiRow;
    return mapApplicationFromApi(raw);
  },

  approve: async (id: number | string): Promise<MerchantApplication> => {
    const client = baseClient.getInstance();
    const response = await client.patch(`/admin/merchant-applications/${id}/approve`);
    const raw = (response.data?.data ?? response.data) as ApplicationApiRow;
    return mapApplicationFromApi(raw);
  },

  reject: async (id: number | string, rejectionReason: string): Promise<MerchantApplication> => {
    const client = baseClient.getInstance();
    const response = await client.patch(`/admin/merchant-applications/${id}/reject`, {
      rejectionReason,
    });
    const raw = (response.data?.data ?? response.data) as ApplicationApiRow;
    return mapApplicationFromApi(raw);
  },
};
