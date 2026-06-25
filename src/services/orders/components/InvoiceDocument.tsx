import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { formatPhone } from '@core/lib/utils/formatPhone';
import { formatOrderCustomerName, orderStatusLabelKey } from '../utils/order-display';
import type { Order } from '../types';

interface InvoiceDocumentProps {
  order: Order;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  onClose: () => void;
}

/**
 * Print-only invoice. Rendered into a portal at document.body with print-only
 * styling so it appears on paper (and print preview) while the dashboard stays
 * hidden. Auto-triggers the browser print dialog on mount.
 */
export function InvoiceDocument({ order, t, dir, onClose }: InvoiceDocumentProps) {
  useEffect(() => {
    // Give the portal a tick to paint, then open the print dialog.
    const timer = window.setTimeout(() => window.print(), 250);
    // Close the printable view once the user finishes / cancels printing.
    const handleAfterPrint = () => onClose();
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  const locale = dir === 'rtl' ? 'ar-IQ' : 'en-US';
  const invoiceDate = new Date().toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return createPortal(
    <div className="forsa-invoice-root" dir={dir}>
      <div className="forsa-invoice">
        {/* Toolbar (screen only, hidden on paper) */}
        <div className="forsa-invoice__toolbar">
          <button type="button" onClick={() => window.print()}>
            {t('invoice.print') || 'Print'}
          </button>
          <button type="button" onClick={onClose}>
            {t('common.close') || 'Close'}
          </button>
        </div>

        <div className="forsa-invoice__page">
          {/* Header */}
          <header className="forsa-invoice__header">
            <div className="forsa-invoice__brand">
              <h1>{t('invoice.brand') || 'Forsa'}</h1>
              <p className="forsa-invoice__brand-sub">
                {t('invoice.brand_tagline') || 'Auction & Group Buy Platform'}
              </p>
            </div>
            <div className="forsa-invoice__title-block">
              <h2>{t('invoice.title') || 'INVOICE'}</h2>
              <p className="forsa-invoice__number">
                {t('invoice.invoice_no') || 'Invoice #'} {order.orderNumber || order.id}
              </p>
              <p className="forsa-invoice__date">
                {t('invoice.date') || 'Date'}: {invoiceDate}
              </p>
            </div>
          </header>

          {/* Parties */}
          <section className="forsa-invoice__parties">
            <div className="forsa-invoice__party">
              <h3>{t('invoice.bill_to') || 'Bill To'}</h3>
              <p className="forsa-invoice__party-name">
                {formatOrderCustomerName(order.customerName, t)}
              </p>
              {order.customerEmail && <p>{order.customerEmail}</p>}
              {order.customerPhone && <p dir="ltr">{formatPhone(order.customerPhone)}</p>}
            </div>
            {hasAddress(order.shippingAddress) && (
              <div className="forsa-invoice__party">
                <h3>{t('orders.shippingAddress') || 'Shipping Address'}</h3>
                {order.shippingAddress.fullName && <p>{order.shippingAddress.fullName}</p>}
                {order.shippingAddress.phone && <p dir="ltr">{formatPhone(order.shippingAddress.phone)}</p>}
                <p>
                  {order.shippingAddress.street}
                  {order.shippingAddress.building ? `, ${order.shippingAddress.building}` : ''}
                </p>
                <p>
                  {order.shippingAddress.city}
                  {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}
                  {order.shippingAddress.country ? `, ${order.shippingAddress.country}` : ''}
                </p>
              </div>
            )}
          </section>

          {/* Meta row */}
          <section className="forsa-invoice__meta">
            <div>
              <span className="forsa-invoice__meta-label">{t('orders.table.date') || 'Order Date'}</span>
              <span>{orderDate}</span>
            </div>
            <div>
              <span className="forsa-invoice__meta-label">{t('orders.orderStatus') || 'Order Status'}</span>
              <span>{t(orderStatusLabelKey(order.status)) || order.status}</span>
            </div>
            <div>
              <span className="forsa-invoice__meta-label">{t('orders.payment') || 'Payment'}</span>
              <span>{t(`orders.payment_status.${order.paymentStatus}`) || order.paymentStatus}</span>
            </div>
            {order.trackingNumber && (
              <div>
                <span className="forsa-invoice__meta-label">{t('orders.trackingNumber') || 'Tracking'}</span>
                <span>{order.trackingNumber}</span>
              </div>
            )}
          </section>

          {/* Items table */}
          <table className="forsa-invoice__table">
            <thead>
              <tr>
                <th className="forsa-invoice__col-desc">{t('invoice.item') || 'Item'}</th>
                <th className="forsa-invoice__col-qty">{t('invoice.qty') || 'Qty'}</th>
                <th className="forsa-invoice__col-price">{t('invoice.unit_price') || 'Unit Price'}</th>
                <th className="forsa-invoice__col-total">{t('invoice.line_total') || 'Total'}</th>
              </tr>
            </thead>
            <tbody>
              {order.items.length > 0 ? (
                order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="forsa-invoice__col-desc">
                      <div className="forsa-invoice__item-name">{item.productName}</div>
                      {item.productSku && (
                        <div className="forsa-invoice__item-sku">SKU: {item.productSku}</div>
                      )}
                    </td>
                    <td className="forsa-invoice__col-qty">{item.quantity}</td>
                    <td className="forsa-invoice__col-price">{formatCurrency(item.unitPrice ?? 0)}</td>
                    <td className="forsa-invoice__col-total">{formatCurrency(item.totalPrice ?? 0)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="forsa-invoice__empty">
                    {t('orders.empty') || 'No items'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <section className="forsa-invoice__totals">
            <div className="forsa-invoice__totals-row">
              <span>{t('orders.subtotal') || 'Subtotal'}</span>
              <span>{formatCurrency(order.subtotal ?? 0)}</span>
            </div>
            <div className="forsa-invoice__totals-row">
              <span>{t('orders.tax') || 'Tax'}</span>
              <span>{formatCurrency(order.tax ?? 0)}</span>
            </div>
            <div className="forsa-invoice__totals-row">
              <span>{t('orders.shipping') || 'Shipping'}</span>
              <span>{formatCurrency(order.shipping ?? 0)}</span>
            </div>
            {order.discount > 0 && (
              <div className="forsa-invoice__totals-row forsa-invoice__totals-row--discount">
                <span>{t('orders.discount') || 'Discount'}</span>
                <span>-{formatCurrency(order.discount ?? 0)}</span>
              </div>
            )}
            <div className="forsa-invoice__grand-total">
              <span>{t('orders.total') || 'Total'}</span>
              <span>{formatCurrency(order.total ?? 0)}</span>
            </div>
          </section>

          {order.notes && (
            <section className="forsa-invoice__notes">
              <h3>{t('orders.notes') || 'Notes'}</h3>
              <p>{order.notes}</p>
            </section>
          )}

          <footer className="forsa-invoice__footer">
            <p>{t('invoice.thank_you') || 'Thank you for your business.'}</p>
            <p className="forsa-invoice__footer-sub">
              {t('invoice.footer_generated') || 'This invoice was generated electronically.'}
            </p>
          </footer>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function hasAddress(addr: Order['shippingAddress']): boolean {
  if (!addr) return false;
  return !!(addr.street || addr.city || addr.state || addr.country || addr.fullName || addr.phone);
}

export default InvoiceDocument;
