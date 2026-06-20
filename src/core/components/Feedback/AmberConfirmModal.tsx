'use client';

import React, { useState, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';
import { getOverlayPortalRoot, useOverlayPortal } from '@core/hooks/useOverlayPortal';

export type ConfirmModalVariant =
  | 'default'
  | 'destructive'
  | 'danger'
  | 'warning'
  | 'success'
  | 'info';

export interface AmberConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variantConfig = {
  default: {
    icon: Info,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    confirmVariant: 'primary' as const,
  },
  destructive: {
    icon: XCircle,
    iconBg: 'bg-danger/10',
    iconColor: 'text-danger',
    confirmVariant: 'outline' as const,
  },
  danger: {
    icon: XCircle,
    iconBg: 'bg-danger/10',
    iconColor: 'text-danger',
    confirmVariant: 'outline' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    confirmVariant: 'primary' as const,
  },
  success: {
    icon: CheckCircle,
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    confirmVariant: 'primary' as const,
  },
  info: {
    icon: Info,
    iconBg: 'bg-brand/10',
    iconColor: 'text-brand',
    confirmVariant: 'primary' as const,
  },
};

const sizeConfig = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
};

export const AmberConfirmModal = React.forwardRef<HTMLDivElement, AmberConfirmModalProps>(
  (
    {
      isOpen,
      onClose,
      onConfirm,
      title,
      message,
      confirmText,
      cancelText,
      variant = 'default',
      isLoading = false,
      size = 'md',
    },
    ref,
  ) => {
    const { t, dir } = useLanguage();
    const titleId = useId();
    const config = variantConfig[variant];
    const IconComponent = config.icon;
    const [isConfirming, setIsConfirming] = useState(false);
    const { shouldRender, isOpen: isModalOpen } = useOverlayPortal(isOpen, onClose);

    const handleConfirm = async () => {
      setIsConfirming(true);
      try {
        await onConfirm();
        onClose();
      } finally {
        setIsConfirming(false);
      }
    };

    const defaultConfirmText = {
      default: t('common.confirm') || 'Confirm',
      destructive: t('common.delete') || 'Delete',
      danger: t('common.delete') || 'Delete',
      warning: t('common.proceed') || 'Proceed',
      success: t('common.done') || 'Done',
      info: t('common.ok') || 'OK',
    };
    const defaultCancelText = t('common.cancel') || 'Cancel';

    if (!shouldRender) return null;

    const modal = (
      <div
        data-zv-modal-backdrop
        role="presentation"
        className={cn(
          'fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm supports-[backdrop-filter]:bg-black/50 transition-opacity duration-150',
          isModalOpen ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            'relative w-full max-h-[90vh] overflow-auto rounded-2xl',
            'bg-obsidian-card border border-white/10',
            'shadow-[0_12px_48px_-10px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/[0.06]',
            'transition-opacity duration-150',
            isModalOpen ? 'opacity-100' : 'opacity-0',
            sizeConfig[size],
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming || isLoading}
            aria-label={t('common.close') || 'Close'}
            className={cn(
              'absolute top-3 end-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              'text-zinc-muted hover:text-zinc-text hover:bg-white/5 active:bg-white/[0.08]',
              'transition-colors z-10',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian-card',
              'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <div className="p-6">
            <div className={cn('flex items-start gap-4', dir === 'rtl' && 'flex-row-reverse')}>
              <div className={cn('shrink-0 p-3 rounded-xl', config.iconBg)}>
                <IconComponent className={cn('w-6 h-6', config.iconColor)} />
              </div>
              <div className={cn('min-w-0 flex-1 space-y-3 pe-8', dir === 'rtl' ? 'text-right' : 'text-left')}>
                <h3 id={titleId} className="text-lg font-bold leading-snug text-zinc-text">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-muted">{message}</p>
              </div>
            </div>

            <div
              className={cn(
                'mt-6 flex gap-3 border-t border-white/10 pt-5',
                dir === 'rtl' ? 'flex-row-reverse' : 'flex-row',
              )}
            >
              <AmberButton
                variant={config.confirmVariant}
                onClick={handleConfirm}
                disabled={isConfirming || isLoading}
                className="min-w-[100px]"
              >
                {isConfirming || isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {t('common.loading') || 'Loading...'}
                  </span>
                ) : (
                  confirmText || defaultConfirmText[variant]
                )}
              </AmberButton>
              <AmberButton
                variant="outline"
                onClick={onClose}
                disabled={isConfirming || isLoading}
                className="min-w-[100px]"
              >
                {cancelText || defaultCancelText}
              </AmberButton>
            </div>
          </div>
        </div>
      </div>
    );

    if (typeof document === 'undefined') return modal;
    return createPortal(modal, getOverlayPortalRoot());
  },
);

AmberConfirmModal.displayName = 'AmberConfirmModal';

export interface UseConfirmModalOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
}

export interface UseConfirmModalReturn {
  openConfirm: (options: UseConfirmModalOptions & { onConfirm: () => void | Promise<void> }) => void;
  closeConfirm: () => void;
  ConfirmModal: React.FC<{ isLoading?: boolean }>;
  isOpen: boolean;
}

export function useConfirmModal(): UseConfirmModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmModalVariant;
  }>({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const openConfirm = useCallback((options: UseConfirmModalOptions & { onConfirm: () => void | Promise<void> }) => {
    setConfig({
      title: options.title || '',
      message: options.message || '',
      onConfirm: options.onConfirm,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      variant: options.variant,
    });
    setIsOpen(true);
  }, []);

  const closeConfirm = useCallback(() => {
    setIsOpen(false);
  }, []);

  const ConfirmModalComponent = useCallback(
    (props: { isLoading?: boolean }) => (
      <AmberConfirmModal
        isOpen={isOpen}
        onClose={closeConfirm}
        onConfirm={config.onConfirm}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        variant={config.variant}
        isLoading={props?.isLoading}
      />
    ),
    [isOpen, config, closeConfirm],
  );

  return {
    openConfirm,
    closeConfirm,
    ConfirmModal: ConfirmModalComponent,
    isOpen,
  };
}

export default AmberConfirmModal;
