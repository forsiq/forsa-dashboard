import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { AmberButton } from '@core/components/AmberButton';
import { useTheme } from '@core/contexts/ThemeContext';
import { useLanguage } from '@core/contexts/LanguageContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between p-4 bg-obsidian-panel border border-white/5 rounded-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-lg">
          {theme === 'dark' ? <Moon className="w-5 h-5 text-zinc-text" /> : <Sun className="w-5 h-5 text-zinc-text" />}
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-text">
            {t('settings.theme') || 'Theme'}
          </p>
          <p className="text-[10px] text-zinc-muted uppercase tracking-wider">
            {theme === 'dark' ? (t('settings.darkMode') || 'Dark Mode') : (t('settings.lightMode') || 'Light Mode')}
          </p>
        </div>
      </div>
      <AmberButton
        variant="outline"
        size="sm"
        onClick={toggleTheme}
      >
        {theme === 'dark' ? (t('settings.switchToLight') || 'Switch to Light') : (t('settings.switchToDark') || 'Switch to Dark')}
      </AmberButton>
    </div>
  );
};
