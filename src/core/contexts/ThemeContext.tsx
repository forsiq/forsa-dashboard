
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTheme, setTheme as setThemeCookie } from '@core/lib/utils/cookieStorage';

export type Theme = 'light' | 'dark';

function normalizeTheme(value: string | undefined): Theme {
  if (value === 'light' || value === 'dark') return value;
  return 'dark';
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  mounted: boolean;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme }) => {
  const [theme, setThemeState] = useState<Theme>(() => normalizeTheme(initialTheme));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = normalizeTheme(getTheme());
    setThemeState((prev) => (prev !== saved ? saved : prev));
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    if (!mounted) return;
    setThemeCookie(theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
