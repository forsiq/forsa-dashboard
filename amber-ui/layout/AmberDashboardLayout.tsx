
import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AmberSidebar } from './components/Sidebar';
import { AmberTopbar } from './components/Topbar';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigation } from '../contexts/NavigationContext';

export const AmberDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { dir } = useLanguage();
  const { activeMode } = useNavigation();
  const location = useLocation();

  if (!activeMode && location.pathname !== '/') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      <AmberTopbar onOpenSidebar={() => setIsSidebarOpen(true)} />
      
      <div className="flex flex-1 relative overflow-hidden">
        <AmberSidebar 
          isOpen={isSidebarOpen} 
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onClose={() => setIsSidebarOpen(false)} 
        />

        <main className={`flex-1 overflow-y-auto scroll-smooth transition-all duration-300 ${isCollapsed ? 'lg:ps-20' : 'lg:ps-64'}`}>
          <div className="max-w-[1600px] mx-auto p-6 md:p-8">
            <Outlet />
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
