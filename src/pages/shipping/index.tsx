import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  AmberButton,
  AmberCard,
  DataTable,
} from '@core/components';
import { ListPageLayout, ListPageToolbar, ListPageToolbarSearch } from '@core/components/Layout';
import type { Column } from '@core/components/Data/DataTable';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useDebounce } from '@core/hooks/useDebounce';
import { useIsClient } from '@core/hooks/useIsClient';
import { ListPageSkeleton } from '@core/loading';
import { EmptyState } from '@core/components/EmptyState';
import { Search, Truck } from 'lucide-react';
import {
  useShipments,
  useSyncNow,
  shippingKeys,
} from '@features/shipping/hooks';
import { ShippingStatusBadge } from '@features/shipping/components';
import { QrReceiptModal } from '@features/shipping/components';
import type { ShipmentInfo } from '@features/shipping/types';

type StatusFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_TABS: { value: StatusFilter }[] = [
  { value: 'all' },
  { value: 'pending' },
  { value: 'shipped' },
  { value: 'delivered' },
  { value: 'cancelled' },
];

export const ShippingManagementPage: React.FC = () => {
  const { t } = useLanguage();
  const isClient = useIsClient();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedQr, setSelectedQr] = useState<ShipmentInfo | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const queryClient = useQueryClient();

  const filters = useMemo(
    () => ({ search: debouncedSearch, status, page, limit }),
    [debouncedSearch, status, page, limit],
  );

  const shipments = useShipments(filters);
  const sync = useSyncNow();

  const columns: Column<ShipmentInfo>[] = useMemo(
    () => [
      {
        key: 'orderId',
        label: t('shipping.table.order'),
        render: (row) => (
          <a
            href={`/orders/${row.orderId}`}
            className="text-brand hover:underline font-medium"
          >
            ORD-{row.orderId}
          </a>
        ),
      },
      {
        key: 'providerQrId',
        label: t('shipping.table.qr_id'),
        render: (row) => (
          <span className="font-mono text-zinc-text">{row.providerQrId}</span>
        ),
      },
      {
        key: 'providerStatusText',
        label: t('shipping.table.provider_status'),
        render: (row) => <ShippingStatusBadge shipment={row} />,
      },
      {
        key: 'lastSyncedAt',
        label: t('shipping.table.last_synced'),
        render: (row) =>
          row.lastSyncedAt ? new Date(row.lastSyncedAt).toLocaleString() : t('shipping.never_synced'),
      },
      {
        key: 'actions',
        label: t('shipping.table.actions'),
        render: (row) => (
          <div className="flex gap-2">
            <AmberButton
              variant="ghost"
              size="sm"
              onClick={() => setSelectedQr(row)}
            >
              {t('shipping.view_qr')}
            </AmberButton>
            <AmberButton
              variant="secondary"
              size="sm"
              onClick={() => {
                sync.mutate(row.orderId);
              }}
              disabled={sync.isPending}
            >
              {t('shipping.sync_now')}
            </AmberButton>
          </div>
        ),
      },
    ],
    [t, sync],
  );

  if (!isClient) {
    return <ListPageSkeleton />;
  }

  return (
    <ListPageLayout
      title={t('shipping.management.title')}
      description={t('shipping.management.subtitle')}
      filterTabs={STATUS_TABS.map((s) => ({ label: t(`shipping.status.${s.value}`) || s.value, value: s.value }))}
      activeFilter={status}
      onFilterChange={(v) => {
        setStatus(v as StatusFilter);
        setPage(1);
      }}
      filters={
        <ListPageToolbar
          search={
            <ListPageToolbarSearch
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder={t('shipping.search')}
            />
          }
          endActions={
            <AmberButton
              variant="secondary"
              size="sm"
              onClick={() => {
                sync.mutate(undefined);
                queryClient.invalidateQueries({ queryKey: shippingKeys.shipments() });
              }}
              disabled={sync.isPending}
            >
              <Truck size={14} />
              {t('shipping.sync_now')}
            </AmberButton>
          }
        />
      }
    >
      <AmberCard className="p-4">
        {shipments.isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : shipments.data && shipments.data.data.length > 0 ? (
          <DataTable
            columns={columns}
            data={shipments.data.data}
            keyField="providerQrId"
            pagination
            totalItems={shipments.data.total}
            currentPage={shipments.data.page}
            pageSize={shipments.data.limit}
            onPageChange={setPage}
          />
        ) : (
          <EmptyState
            icon={Search}
            title={t('shipping.empty')}
            description={t('shipping.empty_description')}
          />
        )}
      </AmberCard>

      <QrReceiptModal
        isOpen={!!selectedQr}
        shipment={selectedQr}
        onClose={() => setSelectedQr(null)}
      />
    </ListPageLayout>
  );
};

export default ShippingManagementPage;
