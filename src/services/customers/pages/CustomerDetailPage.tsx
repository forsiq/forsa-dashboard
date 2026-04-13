import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Building2, Calendar, ShoppingCart, DollarSign, Edit, Trash2, AlertCircle, Loader2, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../../../core/contexts/LanguageContext';
import { cn } from '../../../core/lib/utils/cn';
import { AmberAvatar } from '../../../core/components/AmberAvatar';
import { AmberButton } from '../../../core/components/AmberButton';
import { AmberCard as Card } from '../../../core/components/AmberCard';
import { StatusBadge } from '../../../core/components/Data/StatusBadge';
import { DataTable } from '../../../core/components/Data/DataTable';
import type { Column } from '../../../core/components/Data/DataTable';
import { useGetCustomer, useDeleteCustomer } from '../hooks';
import type { Customer } from '../types';

/**
 * CustomerDetailPage - Customer detail view
 *
 * URL: /customers/:id
 */
export function CustomerDetailPage() {
  const { t, dir } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: customer, isLoading, error } = useGetCustomer(id || '', true);

  const deleteMutation = useDeleteCustomer();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id || '');
    navigate('/customers');
  };

  const isRTL = dir === 'rtl';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-brand)]" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="max-w-md mx-auto p-12 text-center space-y-6">
        <AlertCircle className="w-16 h-16 text-[var(--color-danger)] mx-auto opacity-50" />
        <h2 className="text-xl font-black text-zinc-text uppercase italic">{t('customer.not_found') || 'Entity Missing'}</h2>
        <AmberButton variant="outline" onClick={() => navigate('/customers')} className="font-bold border-[var(--color-border)]">
          <ArrowLeft className={cn("w-4 h-4", isRTL ? "rotate-180" : "")} />
          {t('common.back') || 'Return to Grid'}
        </AmberButton>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-[1400px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link to="/customers" className="p-3 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-obsidian-hover)] transition-all active:scale-95">
            <ArrowLeft className={cn("w-5 h-5 text-zinc-muted", isRTL ? "rotate-180" : "")} />
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">{customer.name}</h1>
            <p className="text-base text-zinc-secondary font-bold opacity-70">{customer.email}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link to={`/customers/${customer.id}/edit`}>
            <AmberButton variant="outline" className="h-11 px-6 border-[var(--color-border)] hover:bg-[var(--color-obsidian-hover)] font-bold rounded-xl text-sm gap-2">
              <Edit className="w-4 h-4" />
              {t('common.edit') || 'تعديل'}
            </AmberButton>
          </Link>
          <AmberButton
            variant="outline"
            className="h-11 px-6 border-[var(--color-danger)]/20 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 font-bold rounded-xl text-sm gap-2"
            onClick={() => {
              if (window.confirm(t('customer.delete_confirm') || 'هل أنت متأكد من حذف هذا العميل؟')) {
                handleDelete();
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
            {t('common.delete') || 'حذف'}
          </AmberButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Core Data */}
        <div className="lg:col-span-2 space-y-8">
          {/* Identity Card */}
          <Card className="!p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand)]/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <AmberAvatar src={customer.avatar} fallback={customer.name} size="xl" className="ring-4 ring-[var(--color-border)] shadow-2xl" />
              <div className="flex-1 text-center md:text-left rtl:md:text-right space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">{customer.name}</h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                    {customer.type === 'business' && (
                      <span className="flex items-center gap-2 text-sm font-bold text-zinc-muted uppercase tracking-widest">
                        <Building2 className="w-4 h-4 text-[var(--color-brand)]" />
                        {customer.company}
                      </span>
                    )}
                    <StatusBadge
                      status={(customer.status || 'unknown').toUpperCase()}
                      variant={customer.status === 'active' ? 'success' : 'inactive'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Comms & Logistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card title={t('customer.contact_info') || 'Communication Matrix'} className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)]">
              <dl className="space-y-6">
                {customer.email && (
                  <div className="flex items-center gap-4 group">
                    <div className="p-2.5 bg-obsidian-outer border border-[var(--color-border)] rounded-xl group-hover:border-[var(--color-brand)]/30 transition-colors">
                      <Mail className="w-5 h-5 text-zinc-muted" />
                    </div>
                    <div>
                      <dt className="text-[11px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('customer.email') || 'Primary Email'}</dt>
                      <dd className="text-sm font-bold text-zinc-text italic">{customer.email}</dd>
                    </div>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-4 group">
                    <div className="p-2.5 bg-obsidian-outer border border-[var(--color-border)] rounded-xl group-hover:border-[var(--color-brand)]/30 transition-colors">
                      <Phone className="w-5 h-5 text-zinc-muted" />
                    </div>
                    <div>
                      <dt className="text-[11px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('customer.phone') || 'Mobile Channel'}</dt>
                      <dd className="text-sm font-bold text-zinc-text tabular-nums">{customer.phone}</dd>
                    </div>
                  </div>
                )}
              </dl>
            </Card>

            <Card title={t('customer.address') || 'Spatial Coordinates'} className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)]">
              <div className="flex items-start gap-4 group">
                <div className="p-2.5 bg-obsidian-outer border border-[var(--color-border)] rounded-xl group-hover:border-[var(--color-brand)]/30 transition-colors">
                  <MapPin className="w-5 h-5 text-zinc-muted" />
                </div>
                <div>
                  <dt className="text-[11px] font-black text-zinc-muted uppercase tracking-[0.2em]">{t('customer.address') || 'Location'}</dt>
                  <dd className="text-sm font-bold text-zinc-text mt-1 leading-relaxed italic">
                    {[customer.address.street, customer.address.city, customer.address.state, customer.address.zipCode, customer.address.country].filter(Boolean).join(', ')}
                  </dd>
                </div>
              </div>
            </Card>
          </div>

          {/* Orders Table */}
          <Card title={t('customer.recent_orders') || 'سجل الطلبات'} className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)]">
            <DataTable
              columns={[
                {
                  key: 'id',
                  label: t('orders.table.id') || '#',
                  render: (row: any) => <span className="font-bold text-zinc-text">#{row.id}</span>,
                },
                {
                  key: 'total',
                  label: t('orders.table.total') || 'الإجمالي',
                  render: (row: any) => <span className="font-black text-zinc-text tabular-nums">${row.total?.toLocaleString() || '0'}</span>,
                  align: 'center' as const,
                },
                {
                  key: 'status',
                  label: t('orders.table.status') || 'الحالة',
                  render: (row: any) => (
                    <StatusBadge
                      status={row.status || 'pending'}
                      variant={row.status === 'delivered' ? 'success' : row.status === 'cancelled' ? 'failed' : 'pending'}
                      size="sm"
                    />
                  ),
                  align: 'center' as const,
                },
                {
                  key: 'createdAt',
                  label: t('orders.table.date') || 'التاريخ',
                  render: (row: any) => <span className="text-zinc-muted text-sm">{row.createdAt ? new Date(row.createdAt).toLocaleDateString(dir === 'rtl' ? 'ar-EG' : 'en-US') : '—'}</span>,
                  align: 'center' as const,
                },
              ]}
              data={[]}
              emptyMessage={t('customer.no_orders') || 'لا توجد طلبات لهذا العميل'}
              pagination
              pageSize={5}
            />
          </Card>
        </div>

        {/* Right Column - Metrics */}
        <div className="space-y-8">
          <Card title={t('customer.statistics') || 'Core Metrics'} className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)]">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-obsidian-outer border border-[var(--color-border)] rounded-xl">
                <span className="text-xs font-bold text-zinc-muted uppercase tracking-widest">{t('customer.total_orders') || 'Order Volume'}</span>
                <span className="text-xl font-black text-zinc-text tabular-nums">{customer.totalOrders ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-obsidian-outer border border-[var(--color-border)] rounded-xl">
                <span className="text-xs font-bold text-zinc-muted uppercase tracking-widest">{t('customer.total_spent') || 'Gross Value'}</span>
                <span className="text-xl font-black text-[var(--color-brand)] tabular-nums flex items-center gap-1.5">
                  <DollarSign className="w-5 h-5" />
                  {customer.totalSpent?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-obsidian-outer border border-[var(--color-border)] rounded-xl">
                <span className="text-xs font-bold text-zinc-muted uppercase tracking-widest">{t('customer.last_order') || 'Last Interaction'}</span>
                <span className="text-sm font-black text-zinc-text uppercase italic">
                  {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'NULL'}
                </span>
              </div>
            </div>
          </Card>

          <Card title={t('customer.member_since') || 'Temporal Node'} className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)]">
            <div className="flex items-center gap-4 p-4 bg-obsidian-outer border border-[var(--color-border)] rounded-xl">
              <Calendar className="w-6 h-6 text-[var(--color-brand)]" />
              <span className="text-base font-black text-zinc-text uppercase italic tracking-tight">
                {new Date(customer.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetailPage;
