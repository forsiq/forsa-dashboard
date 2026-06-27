import React, { useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import { AmberButton } from '@core/components/AmberButton';
import { QRCode } from '@core/components/QRCode';
import { useLanguage } from '@core/contexts/LanguageContext';
import type { ShipmentInfo } from '../types';

export interface QrReceiptModalProps {
  isOpen: boolean;
  shipment: ShipmentInfo | null;
  onClose: () => void;
}

/**
 * QR receipt modal — shows the Al-Waseet qr_id as a QR code + text, with a
 * print button. Uses window.print() (the rest of the UI is hidden via the
 * `.print-shipping-receipt` scope so only the receipt prints).
 */
export const QrReceiptModal: React.FC<QrReceiptModalProps> = ({ isOpen, shipment, onClose }) => {
  const { t, dir } = useLanguage();

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !shipment) return null;

  const handlePrint = () => {
    // Add a class to <html> so a print stylesheet can hide everything except
    // the receipt. Removed right after the print dialog closes.
    const root = document.documentElement;
    root.classList.add('printing-shipping-receipt');
    const cleanup = () => {
      root.classList.remove('printing-shipping-receipt');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    // Fallback cleanup in case afterprint never fires.
    setTimeout(() => {
      root.classList.remove('printing-shipping-receipt');
    }, 5000);
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      dir={dir}
    >
      <div className="print-shipping-receipt relative w-full max-w-md bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 p-2 rounded-lg text-zinc-muted hover:text-zinc-text hover:bg-white/5 transition-colors print:hidden"
          aria-label={t('shipping.close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
          <h3 className="text-lg font-bold text-zinc-text mb-1">{t('shipping.qr_receipt')}</h3>
          <p className="text-xs text-zinc-muted mb-6">{t('shipping.provider.alwaseet')}</p>

          <div className="flex justify-center mb-6">
            <QRCode
              value={shipment.providerQrId}
              size={200}
              title={`QR ${shipment.providerQrId}`}
              className="inline-block p-3 bg-white rounded-xl"
            />
          </div>

          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-zinc-muted">{t('shipping.qr_id')}</span>
              <span className="text-zinc-text font-mono font-bold">{shipment.providerQrId}</span>
            </div>
            {shipment.providerStatusText && (
              <div className="flex justify-between">
                <span className="text-zinc-muted">{t('shipping.provider_status')}</span>
                <span className="text-zinc-text">{shipment.providerStatusText}</span>
              </div>
            )}
          </div>

          {shipment.qrLink && (
            <a
              href={shipment.qrLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs text-brand hover:underline mb-4 print:hidden"
            >
              {t('shipping.view_qr')}
            </a>
          )}

          <div className="flex justify-center gap-3 print:hidden">
            <AmberButton variant="primary" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
              <span>{t('shipping.print_qr')}</span>
            </AmberButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrReceiptModal;
