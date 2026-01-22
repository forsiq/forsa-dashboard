
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { PortalHeader } from '../components/PortalHeader';
import { useNavigation } from '../../../contexts/NavigationContext';

export const PortalLayout = () => {
  const { activeMode } = useNavigation();

  // Basic route protection
  if (!activeMode) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-obsidian-outer flex flex-col relative overflow-hidden font-sans">
      {/* Shared Portal Header */}
      <PortalHeader />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto scroll-smooth">
        <div className="flex-1 w-full max-w-[1600px] mx-auto p-6 md:p-10 animate-fade-up">
           <Outlet />
        </div>
      </main>

      {/* Decorative Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand/5 via-obsidian-outer to-obsidian-outer pointer-events-none -z-10" />
    </div>
  );
};
