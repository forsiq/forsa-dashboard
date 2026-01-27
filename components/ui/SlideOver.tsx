
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';
import { useLanguage } from '../../amber-ui/contexts/LanguageContext';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const SlideOver: React.FC<SlideOverProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer
}) => {
  const { dir } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop */}
        <div 
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )} 
          onClick={onClose}
        />

        <div className={cn(
          "pointer-events-none fixed inset-y-0 flex max-w-full",
          dir === 'rtl' ? "left-0 pl-10" : "right-0 pr-10"
        )}>
          <div 
            className={cn(
              "pointer-events-auto w-screen max-w-2xl transform transition-transform duration-300 ease-in-out bg-obsidian-panel border-s border-white/5 shadow-2xl flex flex-col h-full",
              isOpen 
                ? "translate-x-0" 
                : dir === 'rtl' ? "-translate-x-full" : "translate-x-full"
            )}
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-white/5 bg-obsidian-outer/20 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-zinc-text uppercase tracking-tight italic">{title}</h2>
                {description && (
                  <p className="text-sm font-medium text-zinc-muted mt-1">{description}</p>
                )}
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-zinc-muted hover:text-zinc-text hover:bg-white/5 rounded-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-white/5 bg-obsidian-outer/30 flex justify-end gap-3">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
