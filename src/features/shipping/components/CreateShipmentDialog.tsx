import React, { useMemo, useState } from 'react';
import { Loader2, Package, Truck } from 'lucide-react';
import { AmberButton } from '@core/components/AmberButton';
import { AmberDropdown } from '@core/components';
import { AmberInput } from '@core/components/AmberInput';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useCities, usePackageSizes, useRegions, useShipOrder } from '../hooks';
import type { CreateShipmentInput } from '../types';

export interface CreateShipmentDialogProps {
  isOpen: boolean;
  orderId: string;
  orderTotal?: number;
  orderItems?: { name?: string; quantity?: number; price?: number }[];
  /** Customer full name — auto-fills client_name (read-only). */
  customerName?: string;
  /** Customer phone — auto-fills client_mobile (read-only). */
  customerPhone?: string;
  /** Pre-filled location from the order's shipping address (editable). */
  defaultLocation?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const EMPTY_OPTION = { value: '', label: '' };

/**
 * The region selector. Remounts whenever `cityId` changes (via `key` in the
 * parent) so its local selection resets to "none" automatically — no
 * `setState`-in-`useEffect` required.
 */
const RegionSelect: React.FC<{
  cityId: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ cityId, value, onChange }) => {
  const { t } = useLanguage();
  const regions = useRegions(cityId || undefined);
  const regionOptions = useMemo(
    () => [
      EMPTY_OPTION,
      ...(regions.data || []).map((r) => ({
        value: r.externalId,
        label: r.name,
      })),
    ],
    [regions.data],
  );

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest block text-start">
        {t('shipping.select_region')}
      </label>
      <AmberDropdown
        value={value}
        onChange={onChange}
        options={regionOptions}
        placeholder={
          !cityId
            ? t('shipping.select_city')
            : regions.isLoading
              ? t('common.loading')
              : t('shipping.select_region')
        }
      />
    </div>
  );
};

/**
 * The inner, always-mounted-while-open form. State lives here so that closing
 * the dialog unmounts the component and naturally resets the selected city /
 * region / package size without needing a `setState`-in-`useEffect`.
 */
const CreateShipmentForm: React.FC<{
  orderId: string;
  orderTotal?: number;
  orderItems?: { name?: string; quantity?: number; price?: number }[];
  customerName?: string;
  customerPhone?: string;
  defaultLocation?: string;
  onClose: () => void;
  onSuccess?: () => void;
}> = ({
  orderId,
  orderTotal,
  orderItems,
  customerName,
  customerPhone,
  defaultLocation,
  onClose,
  onSuccess,
}) => {
  const { t, dir } = useLanguage();

  // Customer fields are read-only (auto-filled), exposed for clarity.
  const [clientName] = useState(customerName ?? '');
  const [clientMobile] = useState(customerPhone ?? '');
  const [clientMobile2, setClientMobile2] = useState('');

  // Editable shipping fields.
  const [cityId, setCityId] = useState('');
  const [regionId, setRegionId] = useState('');
  const [location, setLocation] = useState(defaultLocation ?? '');
  const [packageSize, setPackageSize] = useState('');
  const [typeName, setTypeName] = useState('');
  const [itemsNumber, setItemsNumber] = useState('1');
  const [price, setPrice] = useState(
    orderTotal != null ? String(orderTotal) : '0',
  );
  const [replacement, setReplacement] = useState<'0' | '1'>('0');
  const [merchantNotes, setMerchantNotes] = useState('');

  const cities = useCities();
  const sizes = usePackageSizes();
  const ship = useShipOrder();

  const cityOptions = useMemo(
    () => [
      EMPTY_OPTION,
      ...(cities.data || []).map((c) => ({
        value: c.externalId,
        label: c.name,
      })),
    ],
    [cities.data],
  );

  const sizeOptions = useMemo(
    () => [
      EMPTY_OPTION,
      ...(sizes.data || []).map((s) => ({
        value: s.externalId,
        label: s.name,
      })),
    ],
    [sizes.data],
  );

  const itemsCountNum = Number(itemsNumber);
  const priceNum = Number(price);
  const canSubmit =
    !!clientName &&
    !!clientMobile &&
    !!cityId &&
    !!regionId &&
    !!location.trim() &&
    !!typeName.trim() &&
    !!packageSize &&
    Number.isFinite(itemsCountNum) &&
    itemsCountNum >= 1 &&
    Number.isFinite(priceNum) &&
    priceNum >= 0 &&
    !ship.isPending;
  const busy = ship.isPending || cities.isFetching || sizes.isFetching;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const input: CreateShipmentInput = {
      orderId,
      clientName,
      clientMobile,
      cityId,
      regionId,
      location: location.trim(),
      typeName: typeName.trim(),
      itemsNumber: itemsCountNum,
      price: priceNum,
      packageSize,
      replacement: Number(replacement) as 0 | 1,
      ...(clientMobile2 ? { clientMobile2 } : {}),
      ...(merchantNotes.trim() ? { merchantNotes: merchantNotes.trim() } : {}),
    };
    ship.mutate(input, {
      onSuccess: () => {
        onSuccess?.();
        onClose();
      },
    });
  };

  const totalItems = (orderItems || []).reduce(
    (sum, it) => sum + (it.quantity ?? 0),
    0,
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      dir={dir}
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-text">
                {t('shipping.create_shipment')}
              </h3>
              <p className="text-xs text-zinc-muted">
                {t('shipping.order_card.subtitle')}
              </p>
            </div>
          </div>

          {/* Customer (read-only) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AmberInput
              label={t('shipping.customer_name')}
              value={clientName}
              readOnly
              dir={dir}
            />
            <AmberInput
              label={t('shipping.customer_phone')}
              value={clientMobile}
              readOnly
              dir="ltr"
            />
          </div>
          <AmberInput
            label={t('shipping.customer_phone2')}
            value={clientMobile2}
            onChange={(e) => setClientMobile2(e.target.value)}
            dir="ltr"
          />

          {/* Location + goods type */}
          <AmberInput
            label={t('shipping.location')}
            placeholder={t('shipping.location_placeholder')}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            multiline
            rows={2}
            dir={dir}
          />
          <AmberInput
            label={t('shipping.goods_type')}
            placeholder={t('shipping.goods_type_placeholder')}
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            dir={dir}
          />

          {/* City / Region / Package size */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest block text-start">
                {t('shipping.select_city')}
              </label>
              <AmberDropdown
                value={cityId}
                onChange={setCityId}
                options={cityOptions}
                placeholder={
                  cities.isLoading
                    ? t('common.loading')
                    : t('shipping.select_city')
                }
              />
            </div>

            {/* Region picker remounts on city change → selection auto-resets */}
            <RegionSelect
              key={cityId}
              cityId={cityId}
              value={regionId}
              onChange={setRegionId}
            />

            <div className="space-y-2">
              <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest block text-start">
                {t('shipping.select_package_size')}
              </label>
              <AmberDropdown
                value={packageSize}
                onChange={setPackageSize}
                options={sizeOptions}
                placeholder={
                  sizes.isLoading
                    ? t('common.loading')
                    : t('shipping.select_package_size')
                }
              />
            </div>
          </div>

          {/* Items count + COD price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AmberInput
              label={t('shipping.items_count')}
              type="number"
              min={1}
              value={itemsNumber}
              onChange={(e) => setItemsNumber(e.target.value)}
              dir="ltr"
            />
            <div className="space-y-1">
              <AmberInput
                label={t('shipping.cod_amount')}
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                dir="ltr"
              />
              <p className="text-[10px] text-zinc-muted">
                {t('shipping.cod_hint')}
              </p>
            </div>
          </div>

          {/* Replacement toggle */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 accent-brand"
              checked={replacement === '1'}
              onChange={(e) => setReplacement(e.target.checked ? '1' : '0')}
            />
            <span>
              <span className="block text-sm text-zinc-text">
                {t('shipping.replacement')}
              </span>
              <span className="block text-[11px] text-zinc-muted">
                {t('shipping.replacement_desc')}
              </span>
            </span>
          </label>

          {/* Merchant notes */}
          <AmberInput
            label={t('shipping.merchant_notes')}
            value={merchantNotes}
            onChange={(e) => setMerchantNotes(e.target.value)}
            multiline
            rows={2}
            dir={dir}
          />

          {/* Order summary */}
          {(orderTotal != null || totalItems > 0) && (
            <div className="rounded-xl border border-white/5 bg-white/5 p-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-muted">{t('shipping.items')}</span>
                <span className="text-zinc-text">{totalItems}</span>
              </div>
              {orderTotal != null && (
                <div className="flex justify-between">
                  <span className="text-zinc-muted">
                    {t('shipping.price')}
                  </span>
                  <span className="text-zinc-text font-bold">
                    {orderTotal} IQD
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <AmberButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={busy}
            >
              {t('shipping.close')}
            </AmberButton>
            <AmberButton
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {ship.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Package className="w-4 h-4" />
              )}
              <span>
                {ship.isPending
                  ? t('shipping.creating_shipment')
                  : t('shipping.confirm_create')}
              </span>
            </AmberButton>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal that lets an admin/merchant collect the Al-Waseet required fields and
 * create a shipment for an order. Customer name + phone are auto-filled from
 * the order (read-only). Renders the inner form only while open, so closing it
 * unmounts and resets the local form state automatically.
 */
export const CreateShipmentDialog: React.FC<CreateShipmentDialogProps> = ({
  isOpen,
  orderId,
  orderTotal,
  orderItems,
  customerName,
  customerPhone,
  defaultLocation,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;
  return (
    <CreateShipmentForm
      key={orderId}
      orderId={orderId}
      orderTotal={orderTotal}
      orderItems={orderItems}
      customerName={customerName}
      customerPhone={customerPhone}
      defaultLocation={defaultLocation}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};

export default CreateShipmentDialog;
