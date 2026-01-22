
import React from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { AmberDashboardLayout } from '../amber-ui/layout/AmberDashboardLayout';
import { PortalLayout } from '../features/portal/layouts/PortalLayout'; // New Layout
import { LandingSelection } from '../pages/LandingSelection';
import { DashboardPage } from '../pages/DashboardPage';
import { ProductsPage } from '../pages/ProductsPage';
import { OrdersPage } from '../pages/OrdersPage';
import { LoginPage } from '../pages/LoginPage';
import { PortalHome } from '../features/portal/pages/PortalHome'; // New Location
import { PortalSettings } from '../features/portal/pages/PortalSettings'; // New Location
import { AddProduct } from '../pages/AddProduct';
import { Projects } from '../pages/Projects';
import { Records } from '../pages/Records';
import { Reports } from '../pages/Reports';
import { Settings } from '../pages/Settings';
import { Compute } from '../pages/Compute';
import { Profile } from '../pages/Profile';
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
import { Users } from '../pages/Users';
import { RolesPermissions } from '../pages/admin/RolesPermissions';
import { StoresBranches } from '../pages/admin/StoresBranches';
import { Categories } from '../pages/admin/Categories';
import { Integrations } from '../pages/admin/Integrations';
import { paths } from './paths';

const router = createHashRouter([
  {
    path: '/',
    element: <LandingSelection />
  },
  {
    path: '/login',
    element: <LoginPage />
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
  // Portal Routes (Separate Layout)
  {
    element: <PortalLayout />,
    children: [
      {
        path: '/portal',
        element: <PortalHome />
      },
      {
        path: paths.projectSettings,
        element: <PortalSettings />
      }
    ]
  },
  // Admin Dashboard Routes
  {
    element: <AmberDashboardLayout />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />
      },
      {
        path: paths.catalog,
        element: <ProductsPage />
      },
      {
        path: '/catalog/new',
        element: <AddProduct />
      },
      {
        path: paths.orders,
        element: <OrdersPage />
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
        path: paths.adminCategories,
        element: <Categories />
      },
      {
        path: paths.adminIntegrations,
        element: <Integrations />
      },
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
