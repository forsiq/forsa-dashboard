import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { AmberSidebar } from './components/Sidebar';
import { AmberTopbar } from './components/Topbar';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '../contexts/NavigationContext';
import { isPortalPath } from '../../config/sidebarLoader';

interface AmberDashboardLayoutProps {
  children?: React.ReactNode;
}

export const AmberDashboardLayout: React.FC<AmberDashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { language, setLanguage, dir, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { activeMode } = useNavigation();
  const router = useRouter();

  // Check if current page is portal (no sidebar)
  const isPortalPage = isPortalPath(router.pathname);

  // Note: Redirect logic might be better handled in _app.tsx or AuthGuard
  // if (!activeMode && router.pathname !== '/') {
  //   router.push('/');
  //   return null;
  // }

  return (
    <div className="min-h-screen flex flex-col" dir={dir} suppressHydrationWarning>
      <AmberTopbar
        onOpenSidebar={() => setIsSidebarOpen(true)}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
        t={t}
        dir={dir}
      />

      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar - hidden on portal page */}
        {!isPortalPage && (
          <AmberSidebar
            isOpen={isSidebarOpen}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        <main className={`flex-1 overflow-y-auto scroll-smooth transition-all duration-300 ${
          isPortalPage ? '' : (isCollapsed ? 'lg:ps-20' : 'lg:ps-64')
        }`}>
          <div className="max-w-[1600px] mx-auto p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[105] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
