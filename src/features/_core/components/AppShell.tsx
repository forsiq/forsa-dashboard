import React from 'react';
import { AmberDashboardLayout } from '@core/layout/AmberDashboardLayout';

/**
 * AppShell - The main application shell wrapper
 * In Next.js, this is usually handled by _app.tsx or individual page layouts
 */
export const AppShell = ({ children }: { children?: React.ReactNode }) => {
  return <AmberDashboardLayout>{children}</AmberDashboardLayout>;
};

export default AppShell;
