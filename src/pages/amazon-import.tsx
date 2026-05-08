import React, { useState, useEffect } from 'react';
import { ShoppingBag, Package, TrendingUp, Loader2 } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard as Card } from '@core/components/AmberCard';
import { StatsGrid } from '@core/components/Layout/StatsGrid';
import { AmazonSearchBar } from '@features/dashboard/components/AmazonSearchBar';
import { AmazonProductCard } from '@features/dashboard/components/AmazonProductCard';
import { AmazonProductDetailModal } from '@features/dashboard/components/AmazonProductDetailModal';
import { useAmazonSearch, useAmazonBestSellers } from '@services/amazon/hooks/useAmazonSearch';

export default function AmazonImportPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsin, setSelectedAsin] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
  } = useAmazonSearch(searchQuery, {
    enabled: !!searchQuery,
  });

  const {
    data: bestSellersData,
    isLoading: isBestSellersLoading,
  } = useAmazonBestSellers({
    enabled: !searchQuery,
  });

  const products = searchQuery
    ? searchData?.search_results || []
    : bestSellersData?.bestsellers || [];

  const isLoading = searchQuery ? isSearchLoading : isBestSellersLoading;
  const totalResults = searchData?.search_information?.total_results || 0;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleProductClick = (asin: string) => {
    setSelectedAsin(asin);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAsin(null);
  };

  if (!isClient) return null;

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Header */}
      <div className={cn(
        'flex flex-col lg:flex-row lg:items-start justify-between gap-6',
        isRTL ? 'text-right' : 'text-left'
      )}>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-sm bg-brand/10 flex items-center justify-center text-brand border border-brand/20 shadow-[0_0_15px_rgba(245,196,81,0.1)]">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-zinc-text tracking-tighter leading-none uppercase">
                {t('amazon.title') || 'Amazon Import'}
              </h1>
              <p className="text-base text-zinc-secondary font-bold tracking-tight uppercase mt-1">
                {t('amazon.subtitle') || 'Search & import products from Amazon'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <AmazonSearchBar onSearch={handleSearch} isLoading={isLoading} />

      {/* Stats */}
      {searchQuery && !isLoading && (
        <StatsGrid
          stats={[
            {
              label: t('amazon.results_found') || 'Results Found',
              value: totalResults,
              icon: Package,
              color: 'brand',
              description: t('amazon.search_for') || `Search: "${searchQuery}"`,
            },
            {
              label: t('amazon.showing') || 'Showing',
              value: products.length,
              icon: ShoppingBag,
              color: 'info',
              description: t('amazon.products') || 'products',
            },
          ]}
        />
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-brand" />
          <p className="text-sm font-bold text-zinc-muted">
            {searchQuery
              ? (t('amazon.searching') || 'Searching Amazon...')
              : (t('amazon.loading_bestsellers') || 'Loading best sellers...')
            }
          </p>
        </div>
      )}

      {/* Error */}
      {!isLoading && searchError && (
        <Card className="!p-12 text-center space-y-4 bg-obsidian-card/40">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
            <Package className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-black text-zinc-text uppercase tracking-widest">
            {t('amazon.search_error') || 'Search Error'}
          </h3>
          <p className="text-sm text-zinc-muted font-bold">
            {t('amazon.search_error_desc') || 'Failed to search Amazon. Make sure the backend server is running.'}
          </p>
        </Card>
      )}

      {/* Empty */}
      {!isLoading && !searchError && products.length === 0 && searchQuery && (
        <Card className="!p-12 text-center space-y-4 bg-obsidian-card/40">
          <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto border border-white/[0.05]">
            <Package className="w-8 h-8 text-zinc-muted/30" />
          </div>
          <h3 className="text-lg font-black text-zinc-text uppercase tracking-widest">
            {t('amazon.no_results') || 'No Results'}
          </h3>
          <p className="text-sm text-zinc-muted font-bold">
            {t('amazon.no_results_desc') || 'No products found. Try a different search term.'}
          </p>
        </Card>
      )}

      {/* Products Grid */}
      {!isLoading && !searchError && products.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-zinc-muted uppercase tracking-[0.25em] flex items-center gap-2">
              {searchQuery ? (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  {t('amazon.search_results') || 'Search Results'}
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  {t('amazon.bestsellers') || 'Best Sellers'}
                </>
              )}
            </h2>
            <span className="text-[10px] font-bold text-zinc-muted/50 uppercase tracking-widest">
              {products.length} {t('amazon.products') || 'products'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <AmazonProductCard
                key={product.asin}
                product={product}
                onClick={handleProductClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <AmazonProductDetailModal
        asin={selectedAsin}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
