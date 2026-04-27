import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, AlertCircle, X } from 'lucide-react';
import { getOrder, createOrder, updateOrder, orderKeys } from '../api/orders';
import type { CreateOrderInput, UpdateOrderInput, Order } from '../types';
import { AmberButton, AmberCard, AmberInput } from '@core/components';
import { useState, useEffect } from 'react';
import { useLanguage } from '@core/contexts/LanguageContext';

export const OrderFormPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const [isClient, setIsClient] = useState(false);
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [comingSoon, setComingSoon] = useState(false);

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
    // Backend POST /orders endpoint does not exist yet
    setComingSoon(true);
    setSubmitError('This feature is coming soon. Backend endpoint is not available yet.');
  };

  if (!isClient) return null;

  return (
    <div className="space-y-6">
      {/* Submission Error Banner */}
      {submitError && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <p className="text-sm text-danger font-medium">{submitError}</p>
          <button onClick={() => setSubmitError(null)} className="ms-auto text-danger/60 hover:text-danger">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center gap-4">
        <AmberButton
          variant="ghost"
          size="sm"
          onClick={() => router.push('/orders')}
        >
          <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
        </AmberButton>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? t('orders.editOrder') : t('orders.new')}
          </h1>
          <p className="text-zinc-400 mt-1">
            {isEdit ? t('orders.updateOrderDetails') : t('orders.createOrderSubtitle')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Information */}
        <AmberCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('orders.customerInformation')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">{t('orders.customerId')}</label>
              <AmberInput
                {...register('customerId', { required: t('orders.customerIdRequired') })}
                placeholder={t('orders.customerIdPlaceholder')}
                error={errors.customerId?.message}
              />
            </div>
          </div>
        </AmberCard>

        {/* Shipping Address */}
        <AmberCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('orders.shippingAddress')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">{t('orders.fullName')}</label>
              <AmberInput
                {...register('shippingAddress.fullName', { required: 'Required' })}
                placeholder={t('orders.fullName')}
                error={errors.shippingAddress?.fullName?.message}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">{t('orders.phone')}</label>
              <AmberInput
                {...register('shippingAddress.phone', { required: 'Required' })}
                placeholder={t('orders.phone')}
                error={errors.shippingAddress?.phone?.message}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">{t('orders.street')}</label>
              <AmberInput
                {...register('shippingAddress.street', { required: 'Required' })}
                placeholder={t('orders.street')}
                error={errors.shippingAddress?.street?.message}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">{t('orders.city')}</label>
              <AmberInput
                {...register('shippingAddress.city', { required: 'Required' })}
                placeholder={t('orders.city')}
                error={errors.shippingAddress?.city?.message}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">{t('orders.state')}</label>
              <AmberInput
                {...register('shippingAddress.state', { required: 'Required' })}
                placeholder={t('orders.state')}
                error={errors.shippingAddress?.state?.message}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">{t('orders.country')}</label>
              <AmberInput
                {...register('shippingAddress.country', { required: 'Required' })}
                placeholder={t('orders.country')}
                error={errors.shippingAddress?.country?.message}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">{t('orders.postalCode')}</label>
              <AmberInput
                {...register('shippingAddress.postalCode')}
                placeholder={t('orders.postalCode')}
              />
            </div>
          </div>
        </AmberCard>

        {/* Additional Details */}
        <AmberCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('orders.additionalDetails')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">{t('orders.currency')}</label>
              <select
                {...register('currency')}
                className="w-full px-4 py-2 bg-obsidian-card border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
              >
                <option value="IQD">IQD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">{t('orders.priority')}</label>
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
              <label className="block text-sm text-zinc-400 mb-1">{t('orders.notes')}</label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder={t('orders.notesPlaceholder')}
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
            {t('orders.cancel')}
          </AmberButton>
          <AmberButton
            type="submit"
            variant="primary"
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            className="gap-2"
          >
            <Save size={18} />
            {isSubmitting || createMutation.isPending || updateMutation.isPending
              ? t('orders.saving')
              : isEdit ? t('orders.updateOrder') : t('orders.createOrder')
            }
          </AmberButton>
        </div>
      </form>
    </div>
  );
};
