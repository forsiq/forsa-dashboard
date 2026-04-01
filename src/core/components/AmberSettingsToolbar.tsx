import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Languages, Check } from 'lucide-react';
import { cn } from '../lib/utils/cn';
import { languageNames, Language } from '../lib/utils/translations';

export const AmberSettingsToolbar: React.FC<{ className?: string }> = ({ className }) => {
  const { language, setLanguage, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-obsidian-card/40 backdrop-blur-md border border-white/5 text-zinc-muted hover:text-brand hover:border-brand/20 transition-all active:scale-95"
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Language Switcher */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-10 px-4 flex items-center gap-2 rounded-xl bg-obsidian-card/40 backdrop-blur-md border border-white/5 text-zinc-muted hover:text-brand hover:border-brand/20 transition-all active:scale-95",
            isOpen && "text-brand border-brand/20 bg-brand/5"
          )}
        >
          <Languages className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-widest">
            {language.toUpperCase()}
          </span>
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <div className={cn(
              "absolute top-full mt-2 z-50 min-w-[140px] p-1.5 rounded-xl bg-obsidian-card border border-white/10 shadow-2xl animate-fade-in",
              isRTL ? "left-0" : "right-0"
            )}>
              {(Object.keys(languageNames) as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors",
                    language === lang 
                      ? "bg-brand/10 text-brand" 
                      : "text-zinc-muted hover:bg-white/5 hover:text-zinc-text"
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
