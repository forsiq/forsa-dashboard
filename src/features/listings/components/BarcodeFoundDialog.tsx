import { createPortal } from 'react-dom';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { getOverlayPortalRoot } from '@core/hooks/useOverlayPortal';
import { AmberButton } from '@core/components/AmberButton';
import type { ProductListing } from '../../../types/services/listings.types';

interface BarcodeFoundDialogProps {
  listing: ProductListing | null;
  shouldRender: boolean;
  onClose: () => void;
  onViewProduct: (id: string | number) => void;
  t: (key: string) => string;
}

export function BarcodeFoundDialog({
  listing,
  shouldRender,
  onClose,
  onViewProduct,
  t,
}: BarcodeFoundDialogProps) {
  if (!shouldRender || !listing || typeof window === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
              {t('listing.barcode.found_title') || 'Product Already Exists'}
            </h3>
            <p className="text-[13px] text-zinc-muted font-bold truncate max-w-[280px]">
              {listing.title}
            </p>
          </div>
        </div>
        <p className="text-sm text-zinc-muted mb-5">
          {t('listing.barcode.found_desc') ||
            'A product with this barcode already exists in the catalog. You can view it or continue creating a new listing.'}
        </p>
        <div className="flex items-center justify-end gap-3">
          <AmberButton
            variant="outline"
            className="h-10 px-5 font-bold uppercase tracking-wider text-xs"
            onClick={onClose}
          >
            {t('listing.barcode.continue_create') || 'Continue Creating'}
          </AmberButton>
          <AmberButton
            className="h-10 px-5 font-bold uppercase tracking-wider text-xs bg-brand text-black border-none"
            onClick={() => {
              onClose();
              if (listing.id) onViewProduct(listing.id);
            }}
          >
            <ExternalLink className="w-3 h-3 me-1" />
            {t('listing.barcode.view_product') || 'View Product'}
          </AmberButton>
        </div>
      </div>
    </div>,
    getOverlayPortalRoot(),
  );
}
