import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AmberDashboardLayout } from '@core/layout/AmberDashboardLayout';

/**
 * AppShell - The main application shell wrapper
 * Uses AmberDashboardLayout for consistent layout
 * Note: AmberDashboardLayout already has its own Outlet
 */
export const AppShell = () => {
  return <AmberDashboardLayout />;
};
