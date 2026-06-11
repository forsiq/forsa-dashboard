import React, { useRef, useState, useLayoutEffect, useCallback } from 'react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useTheme } from '@core/contexts/ThemeContext';
import { Sun, Moon, Languages, Check } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';
import { languageNames, Language } from '@core/lib/utils/translations';
import { computePopoverPlacement, type PopoverPlacement } from '@core/lib/utils/popover-placement';

export const AmberSettingsToolbar: React.FC<{ className?: string }> = ({ className }) => {
  const { language, setLanguage, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<PopoverPlacement>('below');
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const LANG_MENU_HEIGHT = 200;

  const updatePlacement = useCallback(() => {
    const trigger = containerRef.current?.querySelector<HTMLElement>('[data-lang-trigger]');
    if (!trigger) return;
    const triggerRect = trigger.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? LANG_MENU_HEIGHT;
    setPlacement(computePopoverPlacement(triggerRect, menuHeight));
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePlacement();
  }, [isOpen, updatePlacement]);

  const handleToggle = () => {
    setIsOpen((prev) => {
      if (prev) return false;
      const trigger = containerRef.current?.querySelector<HTMLElement>('[data-lang-trigger]');
      if (trigger) {
        const triggerRect = trigger.getBoundingClientRect();
        setPlacement(computePopoverPlacement(triggerRect, LANG_MENU_HEIGHT));
      }
      return true;
    });
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        onClick={toggleTheme}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-obsidian-card/40 backdrop-blur-md border border-white/5 text-zinc-muted hover:text-brand hover:border-brand/20 transition-all active:scale-95"
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        suppressHydrationWarning
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="relative" ref={containerRef}>
        <button
          data-lang-trigger
          onClick={handleToggle}
          className={cn(
            'h-10 px-4 flex items-center gap-2 rounded-xl bg-obsidian-card/40 backdrop-blur-md border border-white/5 text-zinc-muted hover:text-brand hover:border-brand/20 transition-all active:scale-95',
            isOpen && 'text-brand border-brand/20 bg-brand/5',
          )}
        >
          <Languages className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-widest" suppressHydrationWarning>
            {language.toUpperCase()}
          </span>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setIsOpen(false)}
            />
            <div
              ref={menuRef}
              className={cn(
                'absolute z-50 min-w-[140px] p-1.5 rounded-xl bg-obsidian-card border border-white/10 shadow-2xl animate-in fade-in duration-100',
                placement === 'above'
                  ? 'bottom-full mb-2 slide-in-from-bottom-2'
                  : 'top-full mt-2 slide-in-from-top-2',
                isRTL ? 'left-0' : 'right-0',
              )}
            >
              {(Object.keys(languageNames) as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors',
                    language === lang
                      ? 'bg-brand/10 text-brand'
                      : 'text-zinc-muted hover:bg-white/5 hover:text-zinc-text',
                  )}
                >
                  <span>{languageNames[lang]}</span>
                  {language === lang && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
