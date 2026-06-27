/** Shipping API - Al-Waseet integration. Uses REST endpoints under /shipping. */
import { createApiClient } from '@core/services/ApiClientFactory';
import { API_BASE_URL } from '@config/api';
import type {
  ShippingProviderConfig,
  ShippingProviderName,
  ShippingReferenceItem,
  ShippingReferenceSyncResult,
  ShipmentInfo,
  ShipmentFilters,
  ShipmentsResponse,
  TestConnectionInput,
  TestConnectionResult,
  UpsertProviderInput,
  CreateShipmentInput,
  CreateShipmentResult,
} from '../types';

/**
 * We use the factory's underlying axios instance so the standard interceptors
 * (cookie-based access token, X-Project-ID header, 401 refresh) are applied to
 * every call. The endpoint arg here is a sentinel — the shipping API is not a
 * plain CRUD service, so we hit specific paths manually below.
 */
const shippingBaseApi = createApiClient<unknown, unknown, unknown, unknown>({
  serviceName: 'shipping',
  endpoint: '/shipping',
  apiBaseUrl: API_BASE_URL,
});

/** Convenience accessor for the configured axios instance. */
const http = () => shippingBaseApi.getInstance();

/* ------------------------------------------------------------------ */
/* Query keys factory                                                  */
/* ------------------------------------------------------------------ */

export const shippingKeys = {
  all: ['shipping'] as const,
  providers: () => [...shippingKeys.all, 'providers'] as const,
  cities: () => [...shippingKeys.all, 'cities'] as const,
  regions: (cityId?: string) => [...shippingKeys.all, 'regions', cityId ?? 'all'] as const,
  packageSizes: () => [...shippingKeys.all, 'packageSizes'] as const,
  shipments: () => [...shippingKeys.all, 'shipments'] as const,
  shipmentList: (filters: ShipmentFilters) => [...shippingKeys.shipments(), 'list', filters] as const,
  shipmentByOrder: (orderId: string) => [...shippingKeys.shipments(), 'order', orderId] as const,
};

/* ------------------------------------------------------------------ */
/* Providers                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_PROVIDER: ShippingProviderName = 'alwaseet';

function mapProvider(raw: unknown): ShippingProviderConfig {
  const row = (raw ?? {}) as Record<string, unknown>;
  return {
    id: row.id != null ? String(row.id) : undefined,
    providerName: (row.providerName ?? row.provider_name ?? 'alwaseet') as ShippingProviderName,
    environment: (row.environment ?? 'sandbox') as ShippingProviderConfig['environment'],
    username: String(row.username ?? ''),
    tokenType: (row.tokenType ?? row.token_type) as ShippingProviderConfig['tokenType'],
    isActive:
      row.isActive != null
        ? !!row.isActive
        : row.is_active != null
          ? !!row.is_active
          : true,
    lastLoginAt: (row.lastLoginAt ?? row.last_login_at ?? null) as string | null,
  };
}

function asArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  return [];
}

export async function getProviders(): Promise<ShippingProviderConfig[]> {
  const res = await http().get('/shipping/providers');
  const data = (res?.data?.data ?? res?.data) as unknown;
  const list = asArray(data);
  return list.length > 0 ? list.map(mapProvider) : [];
}

export async function getProvider(
  providerName: ShippingProviderName = DEFAULT_PROVIDER,
): Promise<ShippingProviderConfig | null> {
  const all = await getProviders();
  return all.find((p) => p.providerName === providerName) ?? null;
}

export async function upsertProvider(
  input: UpsertProviderInput,
): Promise<ShippingProviderConfig> {
  const res = await http().post('/shipping/providers', input);
  return mapProvider(res?.data?.data ?? res?.data);
}

export async function setProviderEnabled(
  providerName: ShippingProviderName,
  isActive: boolean,
  environment: ShippingProviderConfig['environment'] = 'sandbox',
): Promise<ShippingProviderConfig> {
  // Toggle only — the backend keeps existing credentials.
  return upsertProvider({
    providerName,
    environment,
    username: '', // backend should ignore empties when toggling isActive
    password: '',
    isActive,
  });
}

/* ------------------------------------------------------------------ */
/* Test connection                                                     */
/* ------------------------------------------------------------------ */

export async function testConnection(
  input: TestConnectionInput = {},
): Promise<TestConnectionResult> {
  const res = await http().post('/shipping/test-connection', {
    providerName: input.providerName ?? DEFAULT_PROVIDER,
    ...input,
  });
  const data = (res?.data?.data ?? res?.data ?? {}) as Record<string, unknown>;
  return {
    success: data.success != null ? !!data.success : true,
    message: data.message != null ? String(data.message) : undefined,
    tokenType: data.tokenType as TestConnectionResult['tokenType'],
    lastLoginAt: data.lastLoginAt != null ? String(data.lastLoginAt) : undefined,
  };
}

/* ------------------------------------------------------------------ */
/* Reference data                                                      */
/* ------------------------------------------------------------------ */

function mapRef(raw: unknown, refType: ShippingReferenceItem['refType']): ShippingReferenceItem {
  const row = (raw ?? {}) as Record<string, unknown>;
  return {
    externalId: String(row.externalId ?? row.external_id ?? row.id ?? ''),
    name: String(row.name ?? ''),
    parentId: (row.parentId ?? row.parent_id ?? null) as string | null | undefined,
    refType,
  };
}

export async function getCities(): Promise<ShippingReferenceItem[]> {
  const res = await http().get('/shipping/reference/cities');
  const data = (res?.data?.data ?? res?.data) as unknown;
  return asArray(data).map((r) => mapRef(r, 'city'));
}

export async function getRegions(cityId: string): Promise<ShippingReferenceItem[]> {
  if (!cityId) return [];
  const res = await http().get('/shipping/reference/regions', { params: { city_id: cityId } });
  const data = (res?.data?.data ?? res?.data) as unknown;
  return asArray(data).map((r) => mapRef(r, 'region'));
}

export async function getPackageSizes(): Promise<ShippingReferenceItem[]> {
  const res = await http().get('/shipping/reference/package-sizes');
  const data = (res?.data?.data ?? res?.data) as unknown;
  return asArray(data).map((r) => mapRef(r, 'package_size'));
}

export async function syncReference(
  providerName: ShippingProviderName = DEFAULT_PROVIDER,
): Promise<ShippingReferenceSyncResult> {
  const res = await http().post('/shipping/sync-reference', { providerName });
  const data = (res?.data?.data ?? res?.data ?? {}) as Record<string, unknown>;
  return {
    providerName,
    cities: Number(data.cities ?? 0),
    regions: Number(data.regions ?? 0),
    packageSizes: Number(data.packageSizes ?? data.package_sizes ?? 0),
    syncedAt: String(data.syncedAt ?? data.synced_at ?? new Date().toISOString()),
  };
}

/* ------------------------------------------------------------------ */
/* Order shipping                                                      */
/* ------------------------------------------------------------------ */

function mapShipment(raw: unknown): ShipmentInfo {
  const row = (raw ?? {}) as Record<string, unknown>;
  return {
    id: row.id != null ? String(row.id) : undefined,
    orderId: String(row.orderId ?? row.order_id ?? ''),
    providerName: (row.providerName ?? row.provider_name ?? 'alwaseet') as ShippingProviderName,
    providerQrId: String(row.providerQrId ?? row.provider_qr_id ?? row.qr_id ?? ''),
    providerOrderId: (row.providerOrderId ?? row.provider_order_id ?? null) as string | null | undefined,
    qrLink: (row.qrLink ?? row.qr_link ?? null) as string | null | undefined,
    providerStatusId: (row.providerStatusId ?? row.provider_status_id ?? null) as string | null | undefined,
    providerStatusText: (row.providerStatusText ?? row.provider_status_text ?? null) as string | null | undefined,
    ourStatus: (row.ourStatus ?? row.our_status ?? null) as ShipmentInfo['ourStatus'],
    lastSyncedAt: (row.lastSyncedAt ?? row.last_synced_at ?? null) as string | null | undefined,
    rawResponse: (row.rawResponse ?? row.raw_response ?? null) as Record<string, unknown> | null,
  };
}

export async function shipOrder(
  input: CreateShipmentInput,
): Promise<CreateShipmentResult> {
  const res = await http().post(`/orders/${input.orderId}/ship`, {
    clientName: input.clientName,
    clientMobile: input.clientMobile,
    ...(input.clientMobile2 ? { clientMobile2: input.clientMobile2 } : {}),
    cityId: input.cityId,
    regionId: input.regionId,
    location: input.location,
    typeName: input.typeName,
    itemsNumber: input.itemsNumber,
    price: input.price,
    packageSize: input.packageSize,
    replacement: input.replacement,
    ...(input.merchantNotes ? { merchantNotes: input.merchantNotes } : {}),
  });
  const raw = (res?.data?.data ?? res?.data ?? {}) as Record<string, unknown>;
  return {
    ...mapShipment(raw),
    price: raw.price != null ? Number(raw.price) : undefined,
    items: Array.isArray(raw.items) ? raw.items : undefined,
  };
}

export async function getOrderShipment(orderId: string): Promise<ShipmentInfo | null> {
  if (!orderId) return null;
  const res = await http().get(`/orders/${orderId}/shipping`);
  const raw = res?.data?.data ?? res?.data ?? null;
  if (!raw) return null;
  return mapShipment(raw);
}

/** Manual polling trigger — admin only. Returns the latest shipment snapshot. */
export async function syncNow(orderId?: string): Promise<ShipmentInfo | { ok: true }> {
  const res = await http().post('/shipping/sync-now', orderId ? { orderId } : undefined);
  const raw = (res?.data?.data ?? res?.data) as unknown;
  if (raw && typeof raw === 'object' && 'providerQrId' in raw) {
    return mapShipment(raw);
  }
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Shipment list (management page)                                     */
/* ------------------------------------------------------------------ */

export async function getShipments(filters: ShipmentFilters = {}): Promise<ShipmentsResponse> {
  const res = await http().get('/shipping/shipments', { params: filters });
  const data = (res?.data?.data ?? []) as unknown;
  const meta = (res?.data ?? {}) as Record<string, unknown>;
  const list = asArray(data).map(mapShipment);
  return {
    data: list,
    total: Number(meta.total ?? list.length),
    page: Number(meta.page ?? filters.page ?? 1),
    limit: Number(meta.limit ?? filters.limit ?? 50),
    totalPages: Number(meta.totalPages ?? meta.total_pages ?? 1),
  };
}
