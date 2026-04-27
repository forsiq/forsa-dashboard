import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils/cn';
import { useLanguage } from '../../contexts/LanguageContext';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AmberSlideOver: React.FC<SlideOverProps> = ({
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
    <div className="fixed inset-0 z-[100] overflow-hidden">
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
          dir === 'rtl' ? "left-0" : "right-0"
        )}>
          <div
            className={cn(
              "pointer-events-auto w-screen max-w-md transform transition-transform duration-300 ease-in-out bg-obsidian-panel border-s border-white/5 shadow-2xl flex flex-col h-full",
              isOpen
                ? "translate-x-0"
                : dir === 'rtl' ? "-translate-x-full" : "translate-x-full"
            )}
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-white/5 bg-obsidian-panel/40 backdrop-blur-md flex items-start justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand/50 to-transparent" />
              <div className="relative z-10">
                <h2 className="text-xl font-black text-zinc-text uppercase tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-brand rounded-full" />
                  {title}
                </h2>
                {description && (
                  <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] mt-1.5 opacity-70">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-zinc-muted hover:text-brand hover:bg-brand/10 rounded-sm transition-all relative z-10 group"
              >
                <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-6 border-t border-white/5 bg-obsidian-panel/60 backdrop-blur-md flex justify-end gap-3">
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
