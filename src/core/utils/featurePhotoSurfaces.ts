/**
 * Registry: `zvs.config.json` feature keys whose UI loads auction/product/campaign imagery.
 *
 * Use this when deciding where client-side placeholder enrichment should run.
 * Implementation lives in `@core/utils/devPhotoFallback` (same placeholders, per-entity rules).
 *
 * Feature keys must match `config.features` in `/zvs.config.json`.
 */
export const FEATURES_THAT_SURFACE_IMAGES = [
  {
    zvsFeatureKey: 'auctions',
    description: 'Auction cards and detail use `AuctionImage` (URLs, `images[]`, or attachments).',
    uiSurfaces: ['AuctionsList', 'AuctionDetails', 'AuctionFormPage'],
    apiWherePlaceholderApplied: 'src/features/auctions/api/auction-api.ts',
    enricher: 'withAuctionPhotoFallback',
  },
  {
    zvsFeatureKey: 'sales',
    description: 'Group buying lists/detail reuse `AuctionImage` on nested `item.images` or top-level `images`.',
    uiSurfaces: ['GroupBuyingListPage', 'GroupBuyingDetailPage'],
    apiWherePlaceholderApplied: 'src/features/sales/api/group-buying-api.ts',
    enricher: 'withGroupBuyingPhotoFallback',
  },
  {
    zvsFeatureKey: 'items',
    description: 'Catalog items map API products to `Item.image` for grids and selectors.',
    uiSurfaces: ['items feature routes / hooks using `getItems` / `getItem`'],
    apiWherePlaceholderApplied: 'src/features/items/api/items.ts',
    enricher: 'resolveItemDisplayImage',
  },
  {
    zvsFeatureKey: 'inventory',
    description: 'Inventory tables and forms use `images[]` / `image_url` from REST inventory.',
    uiSurfaces: ['InventoryOverviewPage', 'ProductAddPage', 'inventory list/detail hooks'],
    apiWherePlaceholderApplied: 'src/services/inventory/api/products.ts',
    enricher: 'withInventoryProductPhotoFallback',
  },
] as const;

export type ImageSurfacedZvsFeatureKey = (typeof FEATURES_THAT_SURFACE_IMAGES)[number]['zvsFeatureKey'];
