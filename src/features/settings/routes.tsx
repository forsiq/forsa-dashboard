import { RouteObject } from 'react-router-dom';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { PreferencesPage } from './pages/PreferencesPage';
import { LanguagePage } from './pages/LanguagePage';

export const settingsRoutes: RouteObject[] = [
  {
    path: '/settings',
    element: <SettingsPage />,
    children: [
      { index: true, element: <ProfilePage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'preferences', element: <PreferencesPage /> },
      { path: 'language', element: <LanguagePage /> }
    ]
  }
];
