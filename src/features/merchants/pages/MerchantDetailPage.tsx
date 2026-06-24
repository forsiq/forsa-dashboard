import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useIsMobile } from '@core/hooks/useIsMobile';
import { AdminListPageShell } from '@core/components/Layout';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { DataTable, Column, Action } from '@core/components/Data/DataTable';
import { DataTableEntityTitle } from '@core/components/Data/DataTableEntityTitle';
import { EmptyState } from '@core/components/EmptyState';
import { AmberButton } from '@core/components/AmberButton';
import { cn } from '@core/lib/utils/cn';
import { DetailPageSkeleton, ListPageSkeleton } from '@core/loading';
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
  Eye,
  CheckCircle2,
} from 'lucide-react';
import dayjs from 'dayjs';
import {
  useGetMerchant,
  useGetMerchantProducts,
  useGetMerchantAuctions,
} from '../hooks/useMerchants';
import type { MerchantAuction, MerchantProduct } from '../services/merchantsService';
import { merchantContactLine } from '../utils/merchantContact';

type TabValue = 'products' | 'auctions';

function merchantStatusVariant(status: string): 'success' | 'error' | 'inactive' {
  switch (status) {
    case 'active': return 'success';
    case 'suspended': return 'error';
    default: return 'inactive';
  }
}

function merchantStatusLabel(status: string, t: (key: string) => string): string {
  return t(`merchant.filter.${status}`) || status;
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
  const totalProducts = merchant.productsCount ?? productList.length;
  const publishedProducts =
    merchant.publishedProductsCount ??
    productList.filter((product) => product.isPublished).length;
  const notPublishedProducts =
    merchant.notPublishedProductsCount ??
    Math.max(0, totalProducts - publishedProducts);
  const contactLine = merchantContactLine(merchant);

  return (
    <AdminListPageShell
      title={merchant.name}
      description={t('merchant.detail.subtitle') || 'Merchant account details and activity'}
      icon={Store}
      headerActions={
        <Link href="/merchants">
          <AmberButton
            variant="outline"
            className="h-9 px-4 text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5 me-1.5" />
            {t('common.back') || 'Back'}
          </AmberButton>
        </Link>
      }
      stats={[
        {
          label: t('merchant.detail.stats.products') || 'Products',
          value: totalProducts.toString(),
          icon: Package,
          color: 'warning',
          description:
            t('merchant.detail.stats.published_summary', {
              published: publishedProducts,
              total: totalProducts,
            }) || `${publishedProducts} published of ${totalProducts}`,
        },
        {
          label: t('merchant.detail.stats.published') || 'Published',
          value: publishedProducts.toString(),
          icon: CheckCircle2,
          color: 'success',
          description:
            t('merchant.detail.stats.not_published', { count: notPublishedProducts }) ||
            `${notPublishedProducts} not published`,
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
          value: merchantStatusLabel(merchant.status, t),
          icon: Activity,
          color: merchant.status === 'active' ? 'success' : 'danger',
          valueClassName: 'text-2xl text-zinc-text tracking-normal [font-variant-numeric:normal]',
        },
      ]}
      statsColumns={5}
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
      <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-3 md:p-5 space-y-3 md:space-y-4">
        <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
          {t('merchant.detail.info') || 'Merchant Information'}
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Phone */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <Phone className="w-4 h-4 text-brand" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-muted uppercase tracking-widest">{t('merchant.detail.phone') || 'Phone'}</p>
              <p className="text-sm font-bold text-zinc-text">{contactLine}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-brand" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-muted uppercase tracking-widest">{t('merchant.detail.email') || 'Email'}</p>
              <p className="text-sm font-bold text-zinc-text break-all">{merchant.email?.trim() || '—'}</p>
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
                labelKey={`merchant.filter.${merchant.status}`}
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

function ProductsTab({
  products,
  isLoading,
  t,
}: {
  products: MerchantProduct[];
  isLoading: boolean;
  t: (key: string) => string;
}) {
  const router = useRouter();
  const { isMobile } = useIsMobile();

  const columns: Column<MerchantProduct>[] = useMemo(
    () => [
      {
        key: 'title',
        label: t('merchant.detail.product.title') || 'Title',
        cardTitle: true,
        className: 'max-w-[min(48vw,28rem)]',
        render: (product) => (
          <div className="flex min-w-0 items-start gap-3">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brand/20 bg-brand/10">
                <Package className="h-4 w-4 text-brand" />
              </div>
            )}
            <div className="min-w-0 flex-1 overflow-hidden">
              <DataTableEntityTitle
                text={product.title}
                href={`/listings/${product.id}`}
                maxLines={3}
              />
            </div>
          </div>
        ),
      },
      {
        key: 'price',
        label: t('merchant.detail.product.price') || 'Price',
        align: 'center',
        render: (product) => (
          <span className="text-[13px] font-black tabular-nums text-zinc-text">
            {Number(product.price).toLocaleString()} IQD
          </span>
        ),
      },
      {
        key: 'category',
        label: t('merchant.detail.product.category') || 'Category',
        cardSubtitle: true,
        render: (product) => (
          <span className="text-[13px] font-bold text-zinc-muted">{product.category || '—'}</span>
        ),
      },
      {
        key: 'status',
        label: t('merchant.detail.product.status') || 'Status',
        cardBadge: true,
        align: 'center',
        render: (product) => (
          <StatusBadge
            status={product.status}
            variant="info"
            showDot
            size="sm"
            className="font-bold text-[11px]"
          />
        ),
      },
      {
        key: 'isPublished',
        label: t('merchant.detail.product.publish_status') || 'Publish',
        align: 'center',
        render: (product) => (
          <StatusBadge
            status={product.isPublished ? 'published' : 'not_published'}
            labelKey={
              product.isPublished
                ? 'listing.filter.publish_status.published'
                : 'listing.filter.publish_status.not_published'
            }
            variant={product.isPublished ? 'success' : 'inactive'}
            showDot
            size="sm"
            className="font-bold text-[11px]"
          />
        ),
      },
    ],
    [t],
  );

  const rowActions: Action<MerchantProduct>[] = useMemo(
    () => [
      {
        label: t('common.view') || 'View',
        icon: Eye,
        onClick: (product) => router.push(`/listings/${product.id}`),
      },
    ],
    [router, t],
  );

  if (isLoading) {
    return <ListPageSkeleton count={4} columns={4} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={t('merchant.detail.no_products') || 'No products yet'}
        description={t('merchant.detail.tabs.products') || 'Products'}
      />
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-obsidian-card)] shadow-sm">
      <DataTable
        columns={columns}
        data={products}
        keyField="id"
        rowActions={rowActions}
        onRowClick={(product) => router.push(`/listings/${product.id}`)}
        showViewToggle
        viewMode={isMobile ? 'grid' : 'table'}
        gridCols={2}
      />
    </div>
  );
}

function AuctionsTab({
  auctions,
  isLoading,
  t,
}: {
  auctions: MerchantAuction[];
  isLoading: boolean;
  t: (key: string) => string;
}) {
  const router = useRouter();
  const { isMobile } = useIsMobile();

  const columns: Column<MerchantAuction>[] = useMemo(
    () => [
      {
        key: 'title',
        label: t('merchant.detail.auction.title') || 'Title',
        cardTitle: true,
        className: 'max-w-[min(48vw,28rem)]',
        render: (auction) => (
          <div className="flex min-w-0 items-start gap-3">
            {auction.imageUrl ? (
              <img
                src={auction.imageUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brand/20 bg-brand/10">
                <Gavel className="h-4 w-4 text-brand" />
              </div>
            )}
            <div className="min-w-0 flex-1 overflow-hidden">
              <DataTableEntityTitle
                text={auction.title}
                href={`/auctions/${auction.id}`}
                maxLines={3}
              />
            </div>
          </div>
        ),
      },
      {
        key: 'startPrice',
        label: t('merchant.detail.auction.start_price') || 'Start Price',
        align: 'center',
        render: (auction) => (
          <span className="text-[13px] font-black tabular-nums text-zinc-text">
            {Number(auction.startPrice).toLocaleString()} IQD
          </span>
        ),
      },
      {
        key: 'currentPrice',
        label: t('merchant.detail.auction.current_price') || 'Current Price',
        align: 'center',
        render: (auction) => (
          <span className="text-[13px] font-black tabular-nums text-brand">
            {Number(auction.currentPrice).toLocaleString()} IQD
          </span>
        ),
      },
      {
        key: 'bidCount',
        label: t('merchant.detail.auction.bids') || 'Bids',
        align: 'center',
        render: (auction) => (
          <span className="text-base font-black tabular-nums text-zinc-text">{auction.bidCount ?? 0}</span>
        ),
      },
      {
        key: 'status',
        label: t('merchant.detail.auction.status') || 'Status',
        cardBadge: true,
        align: 'center',
        render: (auction) => (
          <StatusBadge
            status={auction.status}
            variant="info"
            showDot
            size="sm"
            className="font-bold text-[11px]"
          />
        ),
      },
    ],
    [t],
  );

  const rowActions: Action<MerchantAuction>[] = useMemo(
    () => [
      {
        label: t('common.view') || 'View',
        icon: Eye,
        onClick: (auction) => router.push(`/auctions/${auction.id}`),
      },
    ],
    [router, t],
  );

  if (isLoading) {
    return <ListPageSkeleton count={4} columns={4} />;
  }

  if (auctions.length === 0) {
    return (
      <EmptyState
        icon={Gavel}
        title={t('merchant.detail.no_auctions') || 'No auctions yet'}
        description={t('merchant.detail.tabs.auctions') || 'Auctions'}
      />
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-obsidian-card)] shadow-sm">
      <DataTable
        columns={columns}
        data={auctions}
        keyField="id"
        rowActions={rowActions}
        onRowClick={(auction) => router.push(`/auctions/${auction.id}`)}
        showViewToggle
        viewMode={isMobile ? 'grid' : 'table'}
        gridCols={2}
      />
    </div>
  );
}
