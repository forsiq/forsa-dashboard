'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';
import { ModalIconHeader } from './ModalIconHeader';

export interface DeleteCardConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

export function DeleteCardConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
}: DeleteCardConfirmationProps) {
  const { t, dir } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={cn(
          'bg-obsidian-panel border border-danger/20 rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200',
        )}
        dir={dir}
      >
        <div className="p-6">
          <ModalIconHeader
            icon={AlertTriangle}
            iconBg="bg-danger/10"
            iconColor="text-danger"
            title={title}
            description={message}
            onClose={onClose}
            closeDisabled={loading}
            closeLabel={t('common.close') || 'Close'}
            titleClassName="uppercase tracking-tight"
          />

          <div
            className={cn(
              'mt-6 flex flex-wrap gap-3 border-t border-white/5 pt-5',
              dir === 'rtl' ? 'flex-row-reverse justify-start' : 'flex-row justify-end',
            )}
          >
            <AmberButton
              variant="secondary"
              size="sm"
              onClick={onConfirm}
              disabled={loading}
              className="bg-danger/20 text-danger hover:bg-danger/30 border-danger/30"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {t('common.deleting') || 'Deleting...'}
                </span>
              ) : (
                t('common.delete') || 'Delete'
              )}
            </AmberButton>
            <AmberButton variant="outline" size="sm" onClick={onClose} disabled={loading}>
              {t('common.cancel') || 'Cancel'}
            </AmberButton>
          </div>
        </div>
      </div>
    </div>
  );
}
