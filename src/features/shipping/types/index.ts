// Shipping feature types — Al-Waseet integration (Phase 2 frontend).

export type ShippingProviderName = 'alwaseet';

export type ShippingEnvironment = 'production' | 'sandbox';

export type ShippingTokenType = 'merchant' | 'merchant_user';

/**
 * Shape returned by GET /shipping/providers for the configured provider
 * (credentials are server-side and never exposed; only metadata).
 */
export interface ShippingProviderConfig {
  id?: string;
  providerName: ShippingProviderName;
  environment: ShippingEnvironment;
  username: string;
  tokenType?: ShippingTokenType;
  isActive: boolean;
  lastLoginAt?: string | null;
}

export interface UpsertProviderInput {
  providerName: ShippingProviderName;
  environment: ShippingEnvironment;
  username: string;
  /** Plain-text password; the backend encrypts it (AES-256-GCM). */
  password: string;
  isActive?: boolean;
}

export interface TestConnectionInput {
  providerName?: ShippingProviderName;
  environment?: ShippingEnvironment;
  /** Optional credentials override for unsaved test runs. */
  username?: string;
  password?: string;
}

export interface TestConnectionResult {
  success: boolean;
  message?: string;
  tokenType?: ShippingTokenType;
  lastLoginAt?: string;
}

/** Reference data (cities / regions / package sizes) cached from Al-Waseet. */
export type ShippingReferenceType = 'city' | 'region' | 'package_size';

export interface ShippingReferenceItem {
  externalId: string;
  name: string;
  parentId?: string | null;
  refType?: ShippingReferenceType;
}

export interface ShippingReferenceSyncResult {
  providerName: ShippingProviderName;
  cities: number;
  regions: number;
  packageSizes: number;
  syncedAt: string;
}

/** A shipment linked to an order (shape of GET /orders/:id/shipping). */
export interface ShipmentInfo {
  id?: string;
  orderId: string;
  providerName: ShippingProviderName;
  providerQrId: string;
  providerOrderId?: string | null;
  qrLink?: string | null;
  providerStatusId?: string | null;
  providerStatusText?: string | null;
  ourStatus?: 'shipped' | 'delivered' | 'cancelled' | null;
  lastSyncedAt?: string | null;
  rawResponse?: Record<string, unknown> | null;
}

export interface CreateShipmentInput {
  orderId: string;
  /** Customer full name (Alwaseet: client_name). Auto-filled from the order. */
  clientName: string;
  /** Customer primary phone (Alwaseet: client_mobile). Auto-filled from the order. */
  clientMobile: string;
  /** Optional secondary phone (Alwaseet: client_mobile2). */
  clientMobile2?: string;
  /** Provider city id (Alwaseet: city_id). */
  cityId: string;
  /** Provider region id (Alwaseet: region_id). */
  regionId: string;
  /** Full delivery location / address description (Alwaseet: location). */
  location: string;
  /** Type of goods, e.g. "ملابس" (Alwaseet: type_name). */
  typeName: string;
  /** Number of items in the package (Alwaseet: items_number). */
  itemsNumber: number;
  /** Total COD price in IQD, 0 for prepaid (Alwaseet: price). */
  price: number;
  /** Provider package size id (Alwaseet: package_size). */
  packageSize: string;
  /** Whether the customer can exchange for another item (0 | 1). */
  replacement: 0 | 1;
  /** Optional merchant notes for the driver (Alwaseet: merchant_notes). */
  merchantNotes?: string;
}

export interface CreateShipmentResult extends ShipmentInfo {
  price?: number;
  items?: { name?: string; quantity?: number; price?: number }[];
}

/** Generic list-filters for the shipping management page. */
export interface ShipmentFilters {
  search?: string;
  status?: string | 'all';
  page?: number;
  limit?: number;
}

export interface ShipmentsResponse {
  data: ShipmentInfo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
