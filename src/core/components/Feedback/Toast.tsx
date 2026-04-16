import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast, ToastType } from '../../contexts/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-success" />,
  error: <AlertCircle className="w-5 h-5 text-danger" />,
  info: <Info className="w-5 h-5 text-brand" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning" />,
};

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'bg-success/10 border-success/20 text-success',
  error: 'bg-danger/10 border-danger/20 text-danger',
  info: 'bg-brand/10 border-brand/20 text-brand',
  warning: 'bg-warning/10 border-warning/20 text-warning',
};

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const { isRTL } = useLanguage();

  return (
    <div 
      className={cn(
        "fixed z-[9999] p-4 flex flex-col gap-3 max-w-sm w-full pointer-events-none",
        "top-0",
        isRTL ? "left-0" : "right-0"
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: isRTL ? -100 : 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl overflow-hidden relative group",
              "bg-obsidian-card/80 border-white/10",
              TOAST_STYLES[toast.type]
            )}
          >
            {/* Context line indicator */}
            <div className={cn(
               "absolute top-0 bottom-0 w-1",
               isRTL ? "right-0" : "left-0",
               toast.type === 'success' ? "bg-success" : 
               toast.type === 'error' ? "bg-danger" : 
               toast.type === 'warning' ? "bg-warning" : "bg-brand"
            )} />

            <div className="flex-shrink-0 mt-0.5">
              {TOAST_ICONS[toast.type]}
            </div>
            
            <div className="flex-grow pt-0.5">
              <p className="text-xs font-bold leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-zinc-muted hover:text-zinc-text transition-colors p-1 -mr-1 -mt-1 group-hover:opacity-100 opacity-40"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
