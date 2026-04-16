
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AppMode = 'admin' | 'generic' | 'portal' | null;

interface NavigationContextType {
  activeMode: AppMode;
  switchMode: (mode: AppMode) => void;
  clearMode: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeMode, setActiveMode] = useState<AppMode>('portal');

  React.useEffect(() => {
    const saved = localStorage.getItem('app_mode') as AppMode;
    if (saved) {
      setActiveMode(saved);
    }
  }, []);

  const switchMode = (mode: AppMode) => {
    setActiveMode(mode);
    if (mode) {
      localStorage.setItem('app_mode', mode);
    } else {
      localStorage.removeItem('app_mode');
    }
  };

  const clearMode = () => {
    setActiveMode(null);
    localStorage.removeItem('app_mode');
  };

  return (
    <NavigationContext.Provider value={{ activeMode, switchMode, clearMode }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
