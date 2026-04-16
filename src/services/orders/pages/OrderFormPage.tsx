import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { getOrder, createOrder, updateOrder, orderKeys } from '../api/orders';
import type { CreateOrderInput, UpdateOrderInput, Order } from '../types';
import { AmberButton, AmberCard, AmberInput } from '@core/components';
import { useState, useEffect } from 'react';

export const OrderFormPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: order } = useQuery({
    queryKey: orderKeys.detail(id as string),
    queryFn: () => getOrder(id as string),
    enabled: isEdit && !!id,
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateOrderInput>({
    values: order ? {
      customerId: order.customerId,
      items: order.items.map(({ productId, productName, productSku, quantity, unitPrice }) => ({
        productId,
        productName,
        productSku,
        quantity,
        unitPrice,
      })),
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      notes: order.notes,
      currency: order.currency,
      priority: order.priority,
    } : undefined,
  });

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      router.push(`/orders/${data.id}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateOrderInput) => updateOrder(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      router.push(`/orders/${data.id}`);
    },
  });

  const onSubmit = async (data: CreateOrderInput) => {
    if (isEdit) {
      updateMutation.mutate({ id: id as string, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (!isClient) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <AmberButton
          variant="ghost"
          size="sm"
          onClick={() => router.push('/orders')}
        >
          <ArrowLeft size={18} />
        </AmberButton>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Order' : 'New Order'}
          </h1>
          <p className="text-zinc-400 mt-1">
            {isEdit ? 'Update order details' : 'Create a new order'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Information */}
        <AmberCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Customer Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Customer ID</label>
              <AmberInput
                {...register('customerId', { required: 'Customer ID is required' })}
                placeholder="Enter customer ID"
                error={errors.customerId?.message}
              />
            </div>
          </div>
        </AmberCard>

        {/* Shipping Address */}
        <AmberCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Shipping Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Full Name</label>
              <AmberInput
                {...register('shippingAddress.fullName', { required: 'Required' })}
                placeholder="Full name"
                error={errors.shippingAddress?.fullName?.message}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Phone</label>
              <AmberInput
                {...register('shippingAddress.phone', { required: 'Required' })}
                placeholder="Phone number"
                error={errors.shippingAddress?.phone?.message}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">Street</label>
              <AmberInput
                {...register('shippingAddress.street', { required: 'Required' })}
                placeholder="Street address"
                error={errors.shippingAddress?.street?.message}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">City</label>
              <AmberInput
                {...register('shippingAddress.city', { required: 'Required' })}
                placeholder="City"
                error={errors.shippingAddress?.city?.message}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">State</label>
              <AmberInput
                {...register('shippingAddress.state', { required: 'Required' })}
                placeholder="State"
                error={errors.shippingAddress?.state?.message}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Country</label>
              <AmberInput
                {...register('shippingAddress.country', { required: 'Required' })}
                placeholder="Country"
                error={errors.shippingAddress?.country?.message}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Postal Code</label>
              <AmberInput
                {...register('shippingAddress.postalCode')}
                placeholder="Postal code"
              />
            </div>
          </div>
        </AmberCard>

        {/* Additional Details */}
        <AmberCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Additional Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Currency</label>
              <select
                {...register('currency')}
                className="w-full px-4 py-2 bg-obsidian-card border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Priority</label>
              <select
                {...register('priority')}
                className="w-full px-4 py-2 bg-obsidian-card border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Additional notes..."
                className="w-full px-4 py-2 bg-obsidian-card border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
              />
            </div>
          </div>
        </AmberCard>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <AmberButton
            type="button"
            variant="secondary"
            onClick={() => router.push('/orders')}
          >
            Cancel
          </AmberButton>
          <AmberButton
            type="submit"
            variant="primary"
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            className="gap-2"
          >
            <Save size={18} />
            {isSubmitting || createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : isEdit ? 'Update Order' : 'Create Order'
            }
          </AmberButton>
        </div>
      </form>
    </div>
  );
};
