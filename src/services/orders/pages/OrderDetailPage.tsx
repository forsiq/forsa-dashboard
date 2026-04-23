import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit, Trash2, Package, MapPin, CreditCard, User } from 'lucide-react';
import { getOrder, deleteOrder, updateOrderStatus, orderKeys } from '../api/orders';
import type { Order } from '../types';
import { AmberButton, AmberCard } from '@core/components';
import { formatPhone } from '@core/lib/utils/formatPhone';
import { AmberConfirmModal } from '@core/components/Feedback/AmberConfirmModal';
import { useState, useEffect } from 'react';

export const OrderDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: order, isLoading } = useQuery({
    queryKey: orderKeys.detail(id as string),
    queryFn: () => getOrder(id as string),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      router.push('/orders');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });

  if (!isClient) return null;

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!order) {
    return <div className="text-white">Order not found</div>;
  }

  const statusColors: Record<Order['status'], string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    processing: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-purple-500/20 text-purple-400',
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
          <AmberButton
            variant="ghost"
            size="sm"
            onClick={() => router.push('/orders')}
          >
            <ArrowLeft size={18} />
          </AmberButton>
          <div>
            <h1 className="text-2xl font-bold text-white">{order.orderNumber}</h1>
            <p className="text-zinc-400 mt-1">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AmberCard className="p-4">
          <div className="flex items-center gap-3">
            <Package className="text-zinc-400" size={20} />
            <div>
              <div className="text-zinc-400 text-sm">Order Status</div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                {order.status}
              </span>
            </div>
          </div>
        </AmberCard>
        <AmberCard className="p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="text-zinc-400" size={20} />
            <div>
              <div className="text-zinc-400 text-sm">Payment</div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[order.paymentStatus]}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </AmberCard>
        <AmberCard className="p-4">
          <div className="flex items-center gap-3">
            <User className="text-zinc-400" size={20} />
            <div>
              <div className="text-zinc-400 text-sm">Customer</div>
              <div className="text-white font-medium">{order.customerName}</div>
            </div>
          </div>
        </AmberCard>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <AmberCard className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="flex-1">
                  <div className="text-white font-medium">{item.productName}</div>
                  {item.productSku && (
                    <div className="text-sm text-zinc-400">SKU: {item.productSku}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-white">{item.quantity} x {order.currency}{item.unitPrice.toFixed(2)}</div>
                  <div className="text-sm font-medium text-white">{order.currency}{item.totalPrice.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span>
              <span>{order.currency} {order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Tax</span>
              <span>{order.currency} {order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Shipping</span>
              <span>{order.currency} {order.shipping.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount</span>
                <span>-{order.currency} {order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
              <span>Total</span>
              <span>{order.currency} {order.total.toFixed(2)}</span>
            </div>
          </div>
        </AmberCard>

        {/* Addresses */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <AmberCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-zinc-400" size={18} />
              <h2 className="text-lg font-semibold text-white">Shipping Address</h2>
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-white">{order.shippingAddress.fullName}</div>
              <div className="text-zinc-400">{order.shippingAddress.phone ? formatPhone(order.shippingAddress.phone) : ''}</div>
              <div className="text-zinc-400">
                {order.shippingAddress.street}
                {order.shippingAddress.building && `, ${order.shippingAddress.building}`}
                {order.shippingAddress.floor && `, Floor ${order.shippingAddress.floor}`}
                {order.shippingAddress.apartment && `, Apt ${order.shippingAddress.apartment}`}
              </div>
              <div className="text-zinc-400">
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </div>
              <div className="text-zinc-400">{order.shippingAddress.country}</div>
              {order.shippingAddress.postalCode && (
                <div className="text-zinc-400">{order.shippingAddress.postalCode}</div>
              )}
            </div>
          </AmberCard>

          {/* Notes */}
          {order.notes && (
            <AmberCard className="p-6">
              <h2 className="text-lg font-semibold text-white mb-2">Notes</h2>
              <p className="text-zinc-400 text-sm">{order.notes}</p>
            </AmberCard>
          )}

          {/* Status Actions */}
          <AmberCard className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Update Status</h2>
            <div className="space-y-2">
              {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as Order['status'][]).map((status) => (
                <AmberButton
                  key={status}
                  variant={order.status === status ? 'primary' : 'secondary'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => statusMutation.mutate({ id: order.id, status })}
                  disabled={statusMutation.isPending}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </AmberButton>
              ))}
            </div>
          </AmberCard>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AmberConfirmModal
        isOpen={showDeleteModal}
        title="Delete Order"
        message={`Are you sure you want to delete order ${order.orderNumber}? This action cannot be undone.`}
        onConfirm={() => deleteMutation.mutate(order.id)}
        onClose={() => setShowDeleteModal(false)}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
