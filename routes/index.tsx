
import React from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell/AppShell';
import { LandingSelection } from '../pages/LandingSelection';
import { HomePage } from '../pages/HomePage';
import { CommandCenter } from '../pages/CommandCenter';
import { Catalog } from '../pages/Catalog';
import { AddProduct } from '../pages/AddProduct';
import { Orders } from '../pages/Orders';
import { Projects } from '../pages/Projects';
import { Records } from '../pages/Records';
import { Actions } from '../pages/Actions';
import { Reports } from '../pages/Reports';
import { Settings } from '../pages/Settings';
import { Compute } from '../pages/Compute';
import { Profile } from '../pages/Profile';
import { Login } from '../pages/Login';
import { SignUp } from '../pages/auth/SignUp';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { Help } from '../pages/Help';
import { AuditLogs } from '../pages/core/AuditLogs';
import { NotificationsCenter } from '../pages/core/NotificationsCenter';
import { SearchResults } from '../pages/core/SearchResults';
import { AccessDenied } from '../pages/errors/AccessDenied';
import { Maintenance } from '../pages/core/Maintenance';
import { NotFound } from '../pages/errors/NotFound';
import { ListTemplate } from '../pages/templates/ListTemplate';
import { FormTemplate } from '../pages/templates/FormTemplate';
import { DetailsTemplate } from '../pages/templates/DetailsTemplate';
import { AnalyticsTemplate } from '../pages/templates/AnalyticsTemplate';
import { AutomationTemplate } from '../pages/templates/AutomationTemplate';
import { ServiceHub } from '../pages/templates/ServiceHub';
import { About } from '../pages/About';
// Admin
import { Users } from '../pages/Users';
import { RolesPermissions } from '../pages/admin/RolesPermissions';
import { StoresBranches } from '../pages/admin/StoresBranches';
import { Integrations } from '../pages/admin/Integrations';
import { paths } from './paths';

const router = createHashRouter([
  {
    path: '/',
    element: <LandingSelection />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <SignUp />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/about',
    element: <About />
  },
  {
    path: '/maintenance',
    element: <Maintenance />
  },
  {
    // Wrap main app routes in AppShell
    // Note: We are keeping the paths flat relative to root to preserve existing links
    // AppShell will handle rendering logic
    element: <AppShell />,
    children: [
      {
        path: '/dashboard',
        element: <HomePage />
      },
      {
        path: '/portal',
        element: <CommandCenter />
      },
      {
        path: paths.catalog,
        element: <Catalog />
      },
      {
        path: '/catalog/new',
        element: <AddProduct />
      },
      {
        path: paths.orders,
        element: <Orders />
      },
      {
        path: paths.projects,
        element: <Projects />
      },
      {
        path: paths.records,
        element: <Records />
      },
      {
        path: paths.actions,
        element: <Actions />
      },
      {
        path: paths.analytics,
        element: <Reports />
      },
      {
        path: '/compute',
        element: <Compute />
      },
      {
        path: paths.settings,
        element: <Settings />
      },
      {
        path: paths.profile,
        element: <Profile />
      },
      {
        path: '/help',
        element: <Help />
      },
      {
        path: '/audit-logs',
        element: <AuditLogs />
      },
      {
        path: '/notifications',
        element: <NotificationsCenter />
      },
      {
        path: '/search-results',
        element: <SearchResults />
      },
      {
        path: '/access-denied',
        element: <AccessDenied />
      },
      // Admin
      {
        path: paths.adminUsers,
        element: <Users />
      },
      {
        path: paths.adminRoles,
        element: <RolesPermissions />
      },
      {
        path: paths.adminStores,
        element: <StoresBranches />
      },
      {
        path: paths.adminIntegrations,
        element: <Integrations />
      },
      // Templates
      {
        path: paths.serviceHub,
        element: <ServiceHub />
      },
      {
        path: paths.templateList,
        element: <ListTemplate />
      },
      {
        path: paths.templateForm,
        element: <FormTemplate />
      },
      {
        path: paths.templateDetails,
        element: <DetailsTemplate />
      },
      {
        path: paths.templateAnalytics,
        element: <AnalyticsTemplate />
      },
      {
        path: paths.templateAutomation,
        element: <AutomationTemplate />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);

export const AppRouter = () => <RouterProvider router={router} />;
