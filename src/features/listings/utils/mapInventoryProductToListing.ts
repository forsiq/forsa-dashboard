import type { CreateListingInput, ListingSpec } from '../../../types/services/listings.types';

export interface NormalizedInventoryProduct {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  categoryId?: number;
  categoryLabel?: string;
  brand?: string;
  imageUrl?: string;
  images: string[];
  mainAttachmentId?: number;
  attachmentIds: number[];
  specs: ListingSpec[];
}

function parseCategoryId(raw: unknown): number | undefined {
  if (raw == null || raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function parseAttachmentIds(raw: unknown): number[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : String(raw).split(',');
  return list
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && id > 0);
}

function attributesToSpecs(
  attributes: Record<string, string | number | boolean> | undefined,
): ListingSpec[] {
  if (!attributes) return [];
  return Object.entries(attributes)
    .filter(([label]) => label.trim())
    .map(([label, value]) => ({ label, value: String(value) }));
}

function normalizeImages(item: Record<string, unknown>): string[] {
  const fromList = item.images;
  if (Array.isArray(fromList)) {
    return fromList.filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
  }
  const single =
    (item.imageUrl as string | undefined) ||
    (item.image_url as string | undefined) ||
    (item.image as string | undefined);
  return single ? [single] : [];
}

export function normalizeInventoryProduct(item: Record<string, unknown>): NormalizedInventoryProduct {
  const brandRaw = item.brand;
  const brand =
    typeof brandRaw === 'object' && brandRaw !== null && 'name' in brandRaw
      ? String((brandRaw as { name?: string }).name || '')
      : typeof brandRaw === 'string'
        ? brandRaw
        : '';

  const categoryRaw = item.category;
  const categoryLabel =
    typeof categoryRaw === 'object' && categoryRaw !== null && 'name' in categoryRaw
      ? String((categoryRaw as { name?: string }).name || '')
      : typeof categoryRaw === 'string'
        ? categoryRaw
        : '';

  const images = normalizeImages(item);
  const imageUrl =
    (item.imageUrl as string | undefined) ||
    (item.image_url as string | undefined) ||
    images[0];

  const attributes = item.attributes as Record<string, string | number | boolean> | undefined;

  return {
    id: String(item.id ?? ''),
    name: String(item.name || item.title || ''),
    description: String(item.description || item.descriptionAr || ''),
    sku: item.sku ? String(item.sku) : undefined,
    barcode: item.barcode ? String(item.barcode) : undefined,
    categoryId:
      parseCategoryId(item.categoryId) ??
      parseCategoryId(item.category_id) ??
      (typeof categoryRaw === 'object' && categoryRaw !== null && 'id' in categoryRaw
        ? parseCategoryId((categoryRaw as { id?: unknown }).id)
        : undefined),
    categoryLabel: categoryLabel || undefined,
    brand: brand || undefined,
    imageUrl,
    images,
    mainAttachmentId:
      Number(item.mainAttachmentId ?? item.main_attachment_id) || undefined,
    attachmentIds: parseAttachmentIds(item.attachmentIds ?? item.attachment_ids),
    specs: attributesToSpecs(attributes),
  };
}

export function normalizeInventoryProducts(inventoryData: unknown): NormalizedInventoryProduct[] {
  const raw = inventoryData as { data?: unknown[]; items?: unknown[] } | null | undefined;
  const items = raw?.data ?? raw?.items ?? [];
  if (!Array.isArray(items)) return [];
  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map(normalizeInventoryProduct)
    .filter((p) => p.id && p.name);
}

export interface ListingCatalogFromInventory {
  title: string;
  description: string;
  categoryId?: number;
  brand: string;
  sku: string;
  barcode: string;
  specs: ListingSpec[];
  images: string[];
  attachmentIds: number[];
  mainAttachmentId?: number;
}

export function buildCreateListingInputFromInventory(
  product: NormalizedInventoryProduct,
): CreateListingInput {
  const mapped = mapInventoryProductToListingCatalog(product);
  return {
    title: mapped.title,
    description: mapped.description || undefined,
    categoryId: mapped.categoryId,
    brand: mapped.brand || undefined,
    sku: mapped.sku || undefined,
    barcode: mapped.barcode || undefined,
    specs: mapped.specs.length ? mapped.specs : undefined,
    mainAttachmentId: mapped.mainAttachmentId,
    attachmentIds: mapped.attachmentIds.length ? mapped.attachmentIds : undefined,
    images: mapped.images.length ? mapped.images : undefined,
  };
}

export function mapInventoryProductToListingCatalog(
  product: NormalizedInventoryProduct,
): ListingCatalogFromInventory {
  const images =
    product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  const attachmentIds = product.attachmentIds.length
    ? product.attachmentIds
    : product.mainAttachmentId
      ? [product.mainAttachmentId]
      : [];

  return {
    title: product.name,
    description: product.description || '',
    categoryId: product.categoryId,
    brand: product.brand || '',
    sku: product.sku || '',
    barcode: product.barcode || '',
    specs: product.specs,
    images,
    attachmentIds,
    mainAttachmentId: attachmentIds[0],
  };
}
