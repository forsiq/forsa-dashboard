import React, { useMemo, useState } from 'react';
import { Package, Search, Loader2 } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberSlideOver } from '@core/components/AmberSlideOver';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { EmptyState } from '@core/components/EmptyState';
import { useDebounce } from '@core/hooks/useDebounce';
import { useList as useInventoryList } from '@services/inventory/hooks';
import {
  normalizeInventoryProducts,
  type NormalizedInventoryProduct,
} from '../utils/mapInventoryProductToListing';

interface InventoryProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: NormalizedInventoryProduct) => void;
  /** Override default slide-over description translation key */
  descriptionKey?: string;
}

export function InventoryProductPickerModal({
  isOpen,
  onClose,
  onSelect,
  descriptionKey = 'listing.wizard.pick_from_inventory_desc',
}: InventoryProductPickerModalProps) {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 300);
  const { data: inventoryData, isLoading, isFetching } = useInventoryList({
    search: debouncedSearch || undefined,
    limit: 30,
    isActive: true,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const products = useMemo(
    () => normalizeInventoryProducts(inventoryData),
    [inventoryData],
  );

  const handleSelect = (product: NormalizedInventoryProduct) => {
    onSelect(product);
    setSearch('');
    onClose();
  };

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  return (
    <AmberSlideOver
      isOpen={isOpen}
      onClose={handleClose}
      title={t('listing.wizard.pick_from_inventory') || 'Add product from my products'}
      description={t(descriptionKey) || 'Choose an inventory product to pre-fill this listing.'}
    >
      <div className="space-y-4">
        <div className="relative">
          <Search
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted pointer-events-none',
              isRTL ? 'right-3' : 'left-3',
            )}
          />
          <AmberInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('listing.wizard.pick_from_inventory_search') || 'Search by name or SKU...'}
            className={cn(isRTL ? 'pr-10' : 'pl-10')}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title={t('listing.wizard.pick_from_inventory_empty') || 'No products found'}
            description={
              t('listing.wizard.pick_from_inventory_empty_desc') ||
              'Add products to your inventory first, then link them here.'
            }
          />
        ) : (
          <div className="space-y-2">
            {isFetching && !isLoading ? (
              <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest text-center">
                {t('common.loading') || 'Loading...'}
              </p>
            ) : null}
            <ul className="divide-y divide-white/5 rounded-xl border border-white/5 overflow-hidden">
              {products.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(product)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 text-start hover:bg-white/[0.03] transition-colors',
                      isRTL && 'flex-row-reverse',
                    )}
                  >
                    <div className="w-12 h-12 rounded-lg bg-obsidian-panel border border-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-zinc-muted/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-text truncate">{product.name}</p>
                      <div
                        className={cn(
                          'flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-muted font-medium',
                          isRTL && 'flex-row-reverse justify-end',
                        )}
                      >
                        {product.sku ? <span>{product.sku}</span> : null}
                        {product.sku && product.categoryLabel ? (
                          <span className="opacity-40">•</span>
                        ) : null}
                        {product.categoryLabel ? <span>{product.categoryLabel}</span> : null}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <AmberButton
          variant="ghost"
          className="w-full h-10 rounded-xl font-bold text-zinc-muted"
          onClick={handleClose}
        >
          {t('common.cancel') || 'Cancel'}
        </AmberButton>
      </div>
    </AmberSlideOver>
  );
}
