import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';
import { AmberButton } from '../AmberButton';

// --- Types ---

export type ConfirmModalVariant = 'default' | 'destructive' | 'warning' | 'success' | 'info';

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

// --- Variant Configurations ---

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

// --- Confirm Modal Component ---

/**
 * AmberConfirmModal - Confirmation dialog with variants
 *
 * @example
 * <AmberConfirmModal
 *   isOpen={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   onConfirm={handleAction}
 *   title="Delete Item?"
 *   message="This action cannot be undone."
 *   variant="destructive"
 * />
 */
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
    ref
  ) => {
    const { t, dir } = useLanguage();
    const config = variantConfig[variant];
    const IconComponent = config.icon;
    const [isConfirming, setIsConfirming] = useState(false);

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
      warning: t('common.proceed') || 'Proceed',
      success: t('common.done') || 'Done',
      info: t('common.ok') || 'OK',
    };

    const defaultCancelText = t('common.cancel') || 'Cancel';

    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              ref={ref}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.2 }}
              className={cn(
                'relative bg-obsidian-card border border-white/10 rounded-lg shadow-2xl w-full',
                'max-h-[90vh] overflow-auto',
                sizeConfig[size]
              )}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                disabled={isConfirming || isLoading}
                className={cn(
                  'absolute top-4 right-4 p-1.5 rounded-lg text-zinc-muted',
                  'hover:text-zinc-text hover:bg-white/5',
                  'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                  dir === 'rtl' && 'left-4 right-auto'
                )}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6">
                {/* Icon */}
                <div className={cn('flex items-start gap-4', dir === 'rtl' && 'flex-row-reverse')}>
                  <div className={cn('p-3 rounded-lg', config.iconBg)}>
                    <IconComponent className={cn('w-6 h-6', config.iconColor)} />
                  </div>

                  {/* Content */}
                  <div className={cn('flex-1 space-y-2', dir === 'rtl' ? 'text-right' : 'text-left')}>
                    <h3 className="text-lg font-bold text-zinc-text">
                      {title}
                    </h3>
                    <p className="text-sm text-zinc-muted leading-relaxed">
                      {message}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className={cn(
                  'flex gap-3 mt-6 pt-4 border-t border-white/5',
                  dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'
                )}>
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }
);

AmberConfirmModal.displayName = 'AmberConfirmModal';

// --- Hook for easier usage ---

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

/**
 * useConfirmModal - Hook for easier modal management
 *
 * @example
 * function MyComponent() {
 *   const { openConfirm, ConfirmModal } = useConfirmModal();
 *
 *   const handleDelete = () => {
 *     openConfirm({
 *       title: 'Delete Item?',
 *       message: 'This action cannot be undone.',
 *       variant: 'destructive',
 *       onConfirm: async () => {
 *         await deleteItem();
 *       }
 *     });
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleDelete}>Delete</button>
 *       <ConfirmModal />
 *     </>
 *   );
 * }
 */
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

  const openConfirm = useCallback(
    (options: UseConfirmModalOptions & { onConfirm: () => void | Promise<void> }) => {
      setConfig({
        title: options.title || '',
        message: options.message || '',
        onConfirm: options.onConfirm,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        variant: options.variant,
      });
      setIsOpen(true);
    },
    []
  );

  const closeConfirm = useCallback(() => {
    setIsOpen(false);
  }, []);

  const ConfirmModalComponent = useCallback(
    (props?: { isLoading?: boolean }) => (
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
    [isOpen, config, closeConfirm]
  );

  return {
    openConfirm,
    closeConfirm,
    ConfirmModal: ConfirmModalComponent,
    isOpen,
  };
}

export default AmberConfirmModal;
