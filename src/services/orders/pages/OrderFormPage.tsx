import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, AlertCircle, X } from 'lucide-react';
import { getOrder, updateOrder, orderKeys } from '../api/orders';
import type { UpdateOrderInput } from '../types';
import { AmberButton, AmberCard, AmberInput } from '@core/components';
import { useState, useEffect } from 'react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useToast } from '@core/contexts/ToastContext';
import { DetailPageSkeleton } from '@core/loading';
import { useIsClient } from '@core/hooks/useIsClient';

interface NotesFormData {
  notes: string;
}

export const OrderFormPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const [isClient, setIsClient] = useState(false);
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const [submitError, setSubmitError] = useState<string | null>(null);
  const toast = useToast();
  const clientReady = useIsClient();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isEdit = !!id;

  const { data: order, isPending } = useQuery({
    queryKey: orderKeys.detail(id as string),
    queryFn: () => getOrder(id as string),
    enabled: isEdit && !!id,
  });

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<NotesFormData>({
    values: order ? {
      notes: order.notes ?? '',
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateOrderInput) => updateOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success(t('orders.status_updated') || 'تم تحديث الطلب');
      router.push(`/orders/${id}`);
    },
    onError: (err: any) => {
      setSubmitError(err?.response?.data?.message || err?.message || 'Failed to save.');
    },
  });

  const onSubmit = async (data: NotesFormData) => {
    try {
      setSubmitError(null);
      await updateMutation.mutateAsync({ id: id as string, notes: data.notes });
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || err?.message || 'Failed to save.');
    }
  };

  if (!clientReady || !isClient || (isEdit && isPending)) {
    return <DetailPageSkeleton />;
  }

  if (isEdit && !order) {
    return <div className="text-zinc-text p-8 text-center">{t('orders.notFound')}</div>;
  }

  return (
    <div className="space-y-6">
      {submitError && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <p className="text-sm text-danger font-medium">{submitError}</p>
          <button onClick={() => setSubmitError(null)} className="ms-auto text-danger/60 hover:text-danger">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link href={`/orders/${id}`}>
        <AmberButton variant="ghost" size="sm">
          <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
        </AmberButton>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-text">{t('orders.editOrder') || 'تعديل الطلب'}</h1>
          <p className="text-zinc-muted mt-1">{order?.orderNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AmberCard className="p-6">
          <h2 className="text-lg font-semibold text-zinc-text mb-4">{t('orders.notes') || 'ملاحظات'}</h2>
          <div>
            <textarea
              {...register('notes')}
              rows={5}
              placeholder={t('orders.notesPlaceholder') || 'أضف ملاحظات حول الطلب...'}
              className="w-full px-4 py-2 bg-obsidian-card border border-[var(--color-border)] rounded-lg text-zinc-text focus:outline-none focus:border-brand/30 resize-y"
            />
          </div>
        </AmberCard>

        <div className="flex items-center justify-end gap-3">
          <Link href={`/orders/${id}`}>
          <AmberButton type="button" variant="secondary">
            {t('orders.cancel') || 'إلغاء'}
          </AmberButton>
          </Link>
          <AmberButton
            type="submit"
            variant="primary"
            disabled={isSubmitting || updateMutation.isPending}
            className="gap-2"
          >
            <Save size={18} />
            {isSubmitting || updateMutation.isPending
              ? (t('orders.saving') || 'جاري الحفظ...')
              : (t('orders.updateOrder') || 'حفظ التغييرات')
            }
          </AmberButton>
        </div>
      </form>
    </div>
  );
};
