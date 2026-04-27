
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AppMode = 'admin' | 'generic' | 'portal' | null;
export type SidebarView = 'general' | 'reports';

interface NavigationContextType {
  activeMode: AppMode;
  sidebarView: SidebarView;
  switchMode: (mode: AppMode) => void;
  setSidebarView: (view: SidebarView) => void;
  clearMode: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeMode, setActiveMode] = useState<AppMode>('portal');
  const [sidebarView, setSidebarViewState] = useState<SidebarView>('general');

  React.useEffect(() => {
    const saved = localStorage.getItem('app_mode') as AppMode;
    if (saved) {
      setActiveMode(saved);
    }
    const savedView = localStorage.getItem('sidebar_view') as SidebarView;
    if (savedView) {
      setSidebarViewState(savedView);
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

  const setSidebarView = (view: SidebarView) => {
    setSidebarViewState(view);
    localStorage.setItem('sidebar_view', view);
  };

  const clearMode = () => {
    setActiveMode(null);
    localStorage.removeItem('app_mode');
  };

  return (
    <NavigationContext.Provider value={{ activeMode, sidebarView, switchMode, setSidebarView, clearMode }}>
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
