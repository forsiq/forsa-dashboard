import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { AmberButton } from '../AmberButton';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';

interface DeleteCardConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

export const DeleteCardConfirmation: React.FC<DeleteCardConfirmationProps> = ({
  isOpen, onClose, onConfirm, title, message, loading = false
}) => {
  const { t, dir } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={cn(
          "bg-obsidian-panel border border-danger/20 rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200",
          dir === 'rtl' ? "text-right" : "text-left"
        )}
      >
        <div className="relative p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-danger/10 rounded-full">
              <AlertTriangle className="w-6 h-6 text-danger" />
            </div>
            <div>
              <h3 className="text-lg font-black text-zinc-text uppercase tracking-tight">
                {title}
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-zinc-muted hover:text-zinc-text hover:bg-white/5 rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-xs font-bold text-zinc-muted leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex gap-3 justify-end bg-obsidian-outer/50 -mx-6 -mb-6 p-4 border-t border-white/5">
            <AmberButton 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              disabled={loading}
            >
              {t('common.cancel') || 'Cancel'}
            </AmberButton>
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
          </div>
        </div>
      </div>
    </div>
  );
};
