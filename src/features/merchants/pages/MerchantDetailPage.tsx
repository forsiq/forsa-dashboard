import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useToast } from '@core/contexts/ToastContext';
import { AdminListPageShell } from '@core/components/Layout';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { AmberButton } from '@core/components/AmberButton';
import { cn } from '@core/lib/utils/cn';
import { DetailPageSkeleton } from '@core/loading';
import {
  Store,
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Package,
  Gavel,
  TrendingUp,
  Activity,
  Inbox,
} from 'lucide-react';
import dayjs from 'dayjs';
import {
  useGetMerchant,
  useGetMerchantProducts,
  useGetMerchantAuctions,
} from '../hooks/useMerchants';

type TabValue = 'products' | 'auctions';

function merchantStatusVariant(status: string): 'success' | 'error' | 'inactive' {
  switch (status) {
    case 'active': return 'success';
    case 'suspended': return 'error';
    default: return 'inactive';
  }
}

export function MerchantDetailPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = router.query;
  const merchantId = String(id || '');

  const [activeTab, setActiveTab] = useState<TabValue>('products');

  const { data: merchant, isPending: merchantLoading } = useGetMerchant(merchantId, !!merchantId);
  const { data: products, isPending: productsLoading } = useGetMerchantProducts(merchantId, !!merchantId);
  const { data: auctions, isPending: auctionsLoading } = useGetMerchantAuctions(merchantId, !!merchantId);

  if (merchantLoading || !merchant) {
    return <DetailPageSkeleton />;
  }

  const productList = products || [];
  const auctionList = auctions || [];

  return (
    <AdminListPageShell
      title={merchant.name}
      description={t('merchant.detail.subtitle') || 'Merchant account details and activity'}
      icon={Store}
      headerActions={
        <AmberButton
          variant="outline"
          className="h-9 px-4 text-xs font-bold uppercase tracking-wider"
          onClick={() => router.push('/merchants')}
        >
          <ArrowLeft className="w-3.5 h-3.5 me-1.5" />
          {t('common.back') || 'Back'}
        </AmberButton>
      }
      stats={[
        {
          label: t('merchant.detail.stats.products') || 'Products',
          value: (merchant.productsCount ?? productList.length).toString(),
          icon: Package,
          color: 'warning',
        },
        {
          label: t('merchant.detail.stats.auctions') || 'Auctions',
          value: (merchant.auctionsCount ?? auctionList.length).toString(),
          icon: Gavel,
          color: 'brand',
        },
        {
          label: t('merchant.detail.stats.revenue') || 'Total Revenue',
          value: `${(merchant.totalRevenue ?? 0).toLocaleString()} IQD`,
          icon: TrendingUp,
          color: 'success',
        },
        {
          label: t('merchant.detail.stats.status') || 'Status',
          value: merchant.status,
          icon: Activity,
          color: merchant.status === 'active' ? 'success' : 'danger',
        },
      ]}
      statsColumns={4}
      tabs={
        <div className="flex items-center bg-[var(--color-obsidian-card)] border border-[var(--color-border)] p-1 rounded-xl shadow-sm w-fit">
          {([
            { key: 'products' as TabValue, label: t('merchant.detail.tabs.products') || 'Products', icon: Package, count: productList.length },
            { key: 'auctions' as TabValue, label: t('merchant.detail.tabs.auctions') || 'Auctions', icon: Gavel, count: auctionList.length },
          ]).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors rounded-lg whitespace-nowrap',
                activeTab === tab.key
                  ? 'bg-[var(--color-brand)] text-black shadow-sm'
                  : 'text-zinc-muted hover:text-zinc-text hover:bg-white/[0.02]',
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              <span className={cn(
                'text-[10px] font-black px-1.5 py-0.5 rounded-full',
                activeTab === tab.key ? 'bg-black/20' : 'bg-white/[0.05]',
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-6">
      {/* Merchant Info Card */}
      <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
          {t('merchant.detail.info') || 'Merchant Information'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Phone */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <Phone className="w-4 h-4 text-brand" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-muted uppercase tracking-widest">{t('merchant.detail.phone') || 'Phone'}</p>
              <p className="text-sm font-bold text-zinc-text">{merchant.phone}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-brand" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-muted uppercase tracking-widest">{t('merchant.detail.email') || 'Email'}</p>
              <p className="text-sm font-bold text-zinc-text">{merchant.email || '—'}</p>
            </div>
          </div>

          {/* Joined */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-brand" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-muted uppercase tracking-widest">{t('merchant.detail.joined') || 'Joined'}</p>
              <p className="text-sm font-bold text-zinc-text">{dayjs(merchant.joinedAt).format('MMM D, YYYY')}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-brand" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-muted uppercase tracking-widest">{t('merchant.detail.status') || 'Status'}</p>
              <StatusBadge
                status={merchant.status}
                variant={merchantStatusVariant(merchant.status)}
                showDot
                size="sm"
                className="font-bold text-[11px] mt-0.5"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' ? (
        <ProductsTab products={productList} isLoading={productsLoading} t={t} />
      ) : (
        <AuctionsTab auctions={auctionList} isLoading={auctionsLoading} t={t} />
      )}
      </div>
    </AdminListPageShell>
  );
}

function ProductsTab({ products, isLoading, t }: { products: any[]; isLoading: boolean; t: (key: string) => string }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-4 animate-pulse">
            <div className="h-3 bg-[var(--color-obsidian-outer)] rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-12 text-center">
        <Inbox className="w-10 h-10 text-zinc-muted mx-auto mb-3" />
        <p className="text-sm text-zinc-muted font-bold">
          {t('merchant.detail.no_products') || 'No products yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-[var(--color-border)] bg-white/[0.01]">
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">{t('merchant.detail.product.title') || 'Title'}</span>
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">{t('merchant.detail.product.price') || 'Price'}</span>
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">{t('merchant.detail.product.category') || 'Category'}</span>
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">{t('merchant.detail.product.status') || 'Status'}</span>
      </div>

      <div className="divide-y divide-[var(--color-border)]">
        {products.map((product) => (
          <div key={product.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-2 md:gap-4 px-5 py-3 hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-brand" />
              </div>
              <span className="text-sm font-bold text-zinc-text truncate">{product.title}</span>
            </div>
            <span className="text-sm text-zinc-text tabular-nums font-bold">{Number(product.price).toLocaleString()} IQD</span>
            <span className="text-sm text-zinc-muted">{product.category || '—'}</span>
            <StatusBadge status={product.status} variant="info" showDot size="sm" className="font-bold text-[11px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AuctionsTab({ auctions, isLoading, t }: { auctions: any[]; isLoading: boolean; t: (key: string) => string }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-4 animate-pulse">
            <div className="h-3 bg-[var(--color-obsidian-outer)] rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (auctions.length === 0) {
    return (
      <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-12 text-center">
        <Inbox className="w-10 h-10 text-zinc-muted mx-auto mb-3" />
        <p className="text-sm text-zinc-muted font-bold">
          {t('merchant.detail.no_auctions') || 'No auctions yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_0.7fr_1fr] gap-4 px-5 py-3 border-b border-[var(--color-border)] bg-white/[0.01]">
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">{t('merchant.detail.auction.title') || 'Title'}</span>
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">{t('merchant.detail.auction.start_price') || 'Start Price'}</span>
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">{t('merchant.detail.auction.current_price') || 'Current Price'}</span>
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted text-center">{t('merchant.detail.auction.bids') || 'Bids'}</span>
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-muted">{t('merchant.detail.auction.status') || 'Status'}</span>
      </div>

      <div className="divide-y divide-[var(--color-border)]">
        {auctions.map((auction) => (
          <div key={auction.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_0.7fr_1fr] gap-2 md:gap-4 px-5 py-3 hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                <Gavel className="w-4 h-4 text-brand" />
              </div>
              <span className="text-sm font-bold text-zinc-text truncate">{auction.title}</span>
            </div>
            <span className="text-sm text-zinc-text tabular-nums font-bold">{Number(auction.startPrice).toLocaleString()} IQD</span>
            <span className="text-sm text-zinc-text tabular-nums font-bold text-[var(--color-brand)]">{Number(auction.currentPrice).toLocaleString()} IQD</span>
            <span className="text-sm text-zinc-text text-center tabular-nums font-bold">{auction.bidCount ?? 0}</span>
            <StatusBadge status={auction.status} variant="info" showDot size="sm" className="font-bold text-[11px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
