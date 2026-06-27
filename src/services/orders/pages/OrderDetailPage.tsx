import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Package, CreditCard, User, MapPin, Phone, Clock, CheckCircle, XCircle, Truck, Printer, Download, History } from 'lucide-react';
import { getOrder, updateOrderStatus, updateOrderPaymentStatus, orderKeys } from '../api/orders';
import type { Order, OrderStatus } from '../types';
import { AmberButton, AmberCard } from '@core/components';
import { formatPhone } from '@core/lib/utils/formatPhone';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { useLanguage } from '@core/contexts/LanguageContext';
import { DetailPageSkeleton } from '@core/loading';
import { useRouteParam } from '@core/hooks/useRouteParam';
import { useIsClient } from '@core/hooks/useIsClient';
import { formatOrderCustomerName, orderStatusLabelKey } from '../utils/order-display';
import { useToast } from '@core/contexts/ToastContext';
import { AmberConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useState, useMemo } from 'react';
import { InvoiceDocument } from '../components/InvoiceDocument';
import { useInvoicePrint } from '../hooks/useInvoicePrint';
import { useOrderStatusLogs } from '@services/notifications';
import {
  useOrderShipment,
  useSyncNow,
} from '@features/shipping/hooks';
import {
  CreateShipmentDialog,
  QrReceiptModal,
  ShippingStatusBadge,
} from '@features/shipping/components';
import { RefreshCw, Truck as TruckIcon } from 'lucide-react';

const statusTransitions: Partial<Record<OrderStatus, { status: OrderStatus; icon: React.ElementType; variant: 'default' | 'danger' | 'success' }[]>> = {
  pending: [
    { status: 'confirmed', icon: Clock, variant: 'default' },
    { status: 'cancelled', icon: XCircle, variant: 'danger' },
  ],
  // Payment is tracked independently (own endpoint / paymentStatus field),
  // so there is no manual "paid" step. From "confirmed" the next real action
  // is sending the order to delivery → shipped.
  confirmed: [
    { status: 'shipped', icon: Truck, variant: 'default' },
    { status: 'cancelled', icon: XCircle, variant: 'danger' },
  ],
  paid: [
    { status: 'shipped', icon: Truck, variant: 'default' },
    { status: 'cancelled', icon: XCircle, variant: 'danger' },
  ],
  shipped: [
    { status: 'in_transit', icon: Truck, variant: 'default' },
    { status: 'delivered', icon: CheckCircle, variant: 'success' },
    { status: 'cancelled', icon: XCircle, variant: 'danger' },
  ],
  in_transit: [
    { status: 'delivered', icon: CheckCircle, variant: 'success' },
    { status: 'cancelled', icon: XCircle, variant: 'danger' },
  ],
  delivered: [],
  cancelled: [],
  refunded: [],
  processing: [],
};

function hasAddressContent(addr: Order['shippingAddress']): boolean {
  if (!addr) return false;
  return !!(addr.street || addr.city || addr.state || addr.country || addr.fullName || addr.phone);
}

export const OrderDetailPage = () => {
  const [orderId, paramReady] = useRouteParam('id', { parse: 'string', safe: true });
  const queryClient = useQueryClient();
  const isClient = useIsClient();
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const toast = useToast();
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    status: OrderStatus | null;
  }>({ isOpen: false, status: null });
  const { printOrder, isPrintOpen, printInvoice, closeInvoice } = useInvoicePrint();

  const { data: order, isPending } = useQuery({
    queryKey: orderKeys.detail(orderId || ''),
    queryFn: () => getOrder(orderId || ''),
    enabled: !!orderId,
  });

  // Shipping (Al-Waseet) — only fetched when the order is in a shippable state.
  const isShippable =
    order?.status === 'paid' ||
    order?.status === 'shipped' ||
    order?.status === 'in_transit' ||
    order?.status === 'delivered';
  const shippingOrderId = order?.id != null ? String(order.id) : '';

  const shipment = useOrderShipment(isShippable ? shippingOrderId : undefined);
  const syncMutation = useSyncNow();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const { data: statusLogs } = useOrderStatusLogs(orderId || '');

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success(t('orders.status_updated') || 'تم تحديث حالة الطلب');
    },
    onError: () => {
      toast.error(t('orders.status_update_failed') || 'فشل تحديث حالة الطلب');
    },
  });

  const paymentMutation = useMutation({
    mutationFn: ({ id, isPaid }: { id: string; isPaid: boolean }) =>
      updateOrderPaymentStatus(id, isPaid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success(t('orders.status_updated') || 'تم تحديث حالة الدفع');
    },
    onError: () => {
      toast.error(t('orders.status_update_failed') || 'فشل تحديث حالة الدفع');
    },
  });

  const availableTransitions = useMemo(() => {
    if (!order) return [];
    return statusTransitions[order.status] ?? [];
  }, [order]);

  if (!isClient || !paramReady || !orderId || isPending) {
    return <DetailPageSkeleton />;
  }

  if (!order) {
    return <div className="text-zinc-text">{t('orders.notFound')}</div>;
  }

  const statusColors: Partial<Record<OrderStatus, string>> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    paid: 'bg-cyan-500/20 text-cyan-400',
    processing: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-purple-500/20 text-purple-400',
    in_transit: 'bg-indigo-500/20 text-indigo-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
    refunded: 'bg-orange-500/20 text-orange-400',
  };

  const paymentStatusColors: Record<Order['paymentStatus'], string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    paid: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
    refunded: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/orders">
            <AmberButton
              variant="ghost"
              size="sm"
            >
              <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
            </AmberButton>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-text">{order.orderNumber}</h1>
            <p className="text-zinc-muted mt-1">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AmberButton
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => printInvoice(order)}
          >
            <Printer size={16} />
            <span className="hidden sm:inline">{t('invoice.print_invoice') || 'Print Invoice'}</span>
          </AmberButton>
          <AmberButton
            variant="primary"
            size="sm"
            className="gap-2"
            onClick={() => printInvoice(order)}
          >
            <Download size={16} />
            <span className="hidden sm:inline">{t('invoice.download_pdf') || 'Download PDF'}</span>
          </AmberButton>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AmberCard className="p-4">
          <div className="flex items-center gap-3">
            <Package className="text-zinc-muted" size={20} />
            <div>
              <div className="text-zinc-muted text-sm">{t('orders.orderStatus')}</div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] ?? 'bg-zinc-500/20 text-zinc-400'}`}>
                {t(orderStatusLabelKey(order.status)) || order.status}
              </span>
            </div>
          </div>
        </AmberCard>
        <AmberCard className="p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="text-zinc-muted" size={20} />
            <div>
              <div className="text-zinc-muted text-sm">{t('orders.payment')}</div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[order.paymentStatus]}`}>
                {t(`orders.payment_status.${order.paymentStatus}`) || order.paymentStatus}
              </span>
            </div>
          </div>
        </AmberCard>
        <AmberCard className="p-4">
          <div className="flex items-center gap-3">
            <User className="text-zinc-muted" size={20} />
            <div>
              <div className="text-zinc-muted text-sm">{t('orders.customer')}</div>
              <div className="text-zinc-text font-medium">
                {formatOrderCustomerName(order.customerName, t)}
              </div>
              {order.customerPhone && (
                <div className="text-zinc-muted text-xs mt-0.5 flex items-center gap-1" dir="ltr">
                  <Phone size={10} />
                  {formatPhone(order.customerPhone)}
                </div>
              )}
            </div>
          </div>
        </AmberCard>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <AmberCard className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-zinc-text mb-4">{t('orders.orderItems')}</h2>
          <div className="space-y-4">
            {order.items.length > 0 ? order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {item.image && (
                    <div className="w-12 h-12 rounded-lg bg-obsidian-panel border border-white/5 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-zinc-text font-medium truncate">{item.productName}</div>
                    {item.productSku && (
                      <div className="text-sm text-zinc-muted">SKU: {item.productSku}</div>
                    )}
                  </div>
                </div>
                <div className="text-end shrink-0">
                  <div className="text-zinc-text">{item.quantity} x {formatCurrency(item.unitPrice ?? 0)}</div>
                  <div className="text-sm font-medium text-zinc-text">{formatCurrency(item.totalPrice ?? 0)}</div>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-zinc-muted text-sm">
                {t('orders.empty') || 'لا توجد عناصر'}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
            <div className="flex justify-between text-zinc-muted">
              <span>{t('orders.subtotal')}</span>
              <span>{formatCurrency(order.subtotal ?? 0)}</span>
            </div>
            <div className="flex justify-between text-zinc-muted">
              <span>{t('orders.tax')}</span>
              <span>{formatCurrency(order.tax ?? 0)}</span>
            </div>
            <div className="flex justify-between text-zinc-muted">
              <span>{t('orders.shipping')}</span>
              <span>{formatCurrency(order.shipping ?? 0)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>{t('orders.discount')}</span>
                <span>-{formatCurrency(order.discount ?? 0)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-text font-bold text-lg pt-2 border-t border-white/10">
              <span>{t('orders.total')}</span>
              <span>{formatCurrency(order.total ?? 0)}</span>
            </div>
          </div>
        </AmberCard>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipping Address - only show if there is content */}
          {hasAddressContent(order.shippingAddress) && (
            <AmberCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-zinc-muted" size={18} />
                <h2 className="text-lg font-semibold text-zinc-text">{t('orders.shippingAddress')}</h2>
              </div>
              <div className="space-y-1 text-sm">
                {order.shippingAddress.fullName && (
                  <div className="text-zinc-text">{order.shippingAddress.fullName}</div>
                )}
                {order.shippingAddress.phone && (
                  <div className="text-zinc-muted" dir="ltr">{formatPhone(order.shippingAddress.phone)}</div>
                )}
                <div className="text-zinc-muted">
                  {order.shippingAddress.street}
                  {order.shippingAddress.building && `, ${order.shippingAddress.building}`}
                  {order.shippingAddress.floor && `, Floor ${order.shippingAddress.floor}`}
                  {order.shippingAddress.apartment && `, Apt ${order.shippingAddress.apartment}`}
                </div>
                <div className="text-zinc-muted">
                  {order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}
                </div>
                {order.shippingAddress.country && (
                  <div className="text-zinc-muted">{order.shippingAddress.country}</div>
                )}
                {order.shippingAddress.postalCode && (
                  <div className="text-zinc-muted">{order.shippingAddress.postalCode}</div>
                )}
              </div>
            </AmberCard>
          )}

          {/* Delivery / Tracking Info */}
          {(order.trackingNumber || order.deliveryProvider) && (
            <AmberCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="text-zinc-muted" size={18} />
                <h2 className="text-lg font-semibold text-zinc-text">{t('orders.deliveryInfo') || 'معلومات التوصيل'}</h2>
              </div>
              <div className="space-y-2 text-sm">
                {order.deliveryProvider && (
                  <div className="flex justify-between">
                    <span className="text-zinc-muted">{t('orders.deliveryProvider') || 'شركة التوصيل'}</span>
                    <span className="text-zinc-text font-medium">{order.deliveryProvider}</span>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-zinc-muted">{t('orders.trackingNumber') || 'رقم التتبع'}</span>
                    <span className="text-zinc-text font-mono font-medium">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </AmberCard>
          )}

          {/* Shipping via Al-Waseet — visible only in shippable states */}
          {isShippable && (
            <AmberCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TruckIcon className="text-zinc-muted" size={18} />
                <h2 className="text-lg font-semibold text-zinc-text">
                  {t('shipping.order_card.title') || 'الشحن عبر الوسيط'}
                </h2>
              </div>

              {shipment.isLoading ? (
                <p className="text-sm text-zinc-muted">{t('common.loading') || 'Loading...'}</p>
              ) : shipment.data && shipment.data.providerQrId ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-muted">{t('shipping.qr_id')}</span>
                    <span className="text-zinc-text font-mono font-medium">
                      {shipment.data.providerQrId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-muted">{t('shipping.provider_status')}</span>
                    <ShippingStatusBadge shipment={shipment.data} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-muted">{t('shipping.last_synced')}</span>
                    <span className="text-zinc-text">
                      {shipment.data.lastSyncedAt
                        ? new Date(shipment.data.lastSyncedAt).toLocaleString()
                        : t('shipping.never_synced')}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <AmberButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setQrModalOpen(true)}
                    >
                      <Printer size={14} />
                      <span>{t('shipping.print_qr')}</span>
                    </AmberButton>
                    <AmberButton
                      variant="secondary"
                      size="sm"
                      onClick={() => syncMutation.mutate(order.id)}
                      disabled={syncMutation.isPending}
                    >
                      <RefreshCw size={14} className={syncMutation.isPending ? 'animate-spin' : ''} />
                      <span>{t('shipping.sync_now')}</span>
                    </AmberButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-muted">{t('shipping.no_shipment')}</p>
                  {order.status === 'paid' && (
                    <AmberButton
                      variant="primary"
                      size="sm"
                      onClick={() => setCreateDialogOpen(true)}
                    >
                      <TruckIcon size={14} />
                      <span>{t('shipping.create_shipment')}</span>
                    </AmberButton>
                  )}
                </div>
              )}
            </AmberCard>
          )}

          {/* Notes */}
          {order.notes && (
            <AmberCard className="p-6">
              <h2 className="text-lg font-semibold text-zinc-text mb-2">{t('orders.notes')}</h2>
              <p className="text-zinc-muted text-sm whitespace-pre-wrap">{order.notes}</p>
            </AmberCard>
          )}

          {/* Status Actions - only show allowed transitions */}
          {availableTransitions.length > 0 && (
            <AmberCard className="p-6">
              <h2 className="text-lg font-semibold text-zinc-text mb-4">{t('orders.updateStatus')}</h2>
              <div className="space-y-2">
                {availableTransitions.map(({ status, icon: Icon, variant }) => {
                  const isActive = order.status === status;
                  const btnClass =
                    variant === 'danger'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                      : variant === 'success'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                        : 'bg-white/5 text-zinc-text border border-white/10 hover:bg-white/10';
                  return (
                    <AmberButton
                      key={status}
                      variant="secondary"
                      size="sm"
                      className={`w-full justify-start gap-2 ${btnClass}`}
                      onClick={() => setConfirmState({ isOpen: true, status })}
                      disabled={statusMutation.isPending}
                    >
                      <Icon size={14} />
                      {t(orderStatusLabelKey(status)) || status}
                    </AmberButton>
                  );
                })}
              </div>
            </AmberCard>
          )}

          {/* Mark as Paid - show when unpaid and status allows */}
          {order.paymentStatus !== 'paid' && order.status !== 'cancelled' && order.status !== 'delivered' && (
            <AmberCard className="p-6">
              <h2 className="text-lg font-semibold text-zinc-text mb-4">{t('orders.payment')}</h2>
              <AmberButton
                variant="primary"
                size="sm"
                className="w-full gap-2"
                onClick={() => paymentMutation.mutate({ id: order.id, isPaid: true })}
                disabled={paymentMutation.isPending}
              >
                <CheckCircle size={14} />
                {t('orders.payment_status.paid') || 'Mark as Paid'}
              </AmberButton>
            </AmberCard>
          )}
        </div>
      </div>

      {/* Status History Timeline */}
      {statusLogs && statusLogs.length > 0 && (
        <AmberCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="text-zinc-muted" size={18} />
            <h2 className="text-lg font-semibold text-zinc-text">
              {t('orders.status_history') || 'سجل تغييرات الحالة'}
            </h2>
          </div>
          <div className="relative">
            {statusLogs.map((log, idx) => {
              const isLast = idx === statusLogs.length - 1;
              return (
                <div key={log.id} className="flex gap-4 pb-6 last:pb-0 relative">
                  {!isLast && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-white/10" />
                  )}
                  <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                    log.toStatus === 'cancelled'
                      ? 'bg-red-500/20'
                      : log.toStatus === 'delivered'
                        ? 'bg-green-500/20'
                        : 'bg-brand/20'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      log.toStatus === 'cancelled'
                        ? 'bg-red-400'
                        : log.toStatus === 'delivered'
                          ? 'bg-green-400'
                          : 'bg-brand'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {log.fromStatus && (
                        <>
                          <span className="text-xs font-medium text-zinc-muted">
                            {t(orderStatusLabelKey(log.fromStatus as OrderStatus)) || log.fromStatus}
                          </span>
                          <span className="text-zinc-muted text-xs">→</span>
                        </>
                      )}
                      <span className={`text-xs font-bold ${
                        log.toStatus === 'cancelled'
                          ? 'text-red-400'
                          : log.toStatus === 'delivered'
                            ? 'text-green-400'
                            : 'text-brand'
                      }`}>
                        {t(orderStatusLabelKey(log.toStatus as OrderStatus)) || log.toStatus}
                      </span>
                    </div>
                    {log.notes && (
                      <p className="text-sm text-zinc-muted">{log.notes}</p>
                    )}
                    <p className="text-[11px] text-zinc-muted/70">
                      {log.changedBy && (
                        <span className="font-mono mr-2" dir="ltr">
                          {log.changedBy.slice(0, 8)}…
                        </span>
                      )}
                      {log.createdAt && new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </AmberCard>
      )}

      {/* Status Change Confirmation Modal */}
      <AmberConfirmModal
        isOpen={confirmState.isOpen}
        title={t('orders.updateStatus') || 'تحديث حالة الطلب'}
        message={`${t('orders.status_change_confirm') || 'هل تريد تغيير حالة الطلب إلى'} "${confirmState.status ? t(orderStatusLabelKey(confirmState.status)) : ''}"?`}
        onConfirm={() => {
          if (confirmState.status) {
            statusMutation.mutate({ id: order.id, status: confirmState.status });
          }
          setConfirmState({ isOpen: false, status: null });
        }}
        onClose={() => setConfirmState({ isOpen: false, status: null })}
        variant="warning"
        isLoading={statusMutation.isPending}
      />

      {isPrintOpen && printOrder && (
        <InvoiceDocument order={printOrder} t={t} dir={dir} onClose={closeInvoice} />
      )}

      {/* Al-Waseet shipment flows */}
      <CreateShipmentDialog
        isOpen={createDialogOpen}
        orderId={String(order.id)}
        orderTotal={order.total}
        orderItems={order.items.map((i) => ({
          name: i.productName,
          quantity: i.quantity,
          price: i.totalPrice,
        }))}
        customerName={order.customerName}
        customerPhone={order.customerPhone}
        defaultLocation={[
          order.shippingAddress?.street,
          order.shippingAddress?.building,
          order.shippingAddress?.floor
            ? `Floor ${order.shippingAddress.floor}`
            : undefined,
          order.shippingAddress?.apartment
            ? `Apt ${order.shippingAddress.apartment}`
            : undefined,
          order.shippingAddress?.city,
          order.shippingAddress?.state,
        ]
          .filter(Boolean)
          .join(', ')}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: orderKeys.all });
        }}
      />
      <QrReceiptModal
        isOpen={qrModalOpen}
        shipment={shipment.data ?? null}
        onClose={() => setQrModalOpen(false)}
      />
    </div>
  );
};
