import { RouteObject } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OTPPage } from './pages/OTPPage';
import { AmberAuthLayout } from '@core/layout/AmberAuthLayout';

const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <AmberAuthLayout>
        <LoginPage />
      </AmberAuthLayout>
    )
  },
  {
    path: '/register',
    element: (
      <AmberAuthLayout>
        <RegisterPage />
      </AmberAuthLayout>
    )
  },
  {
    path: '/otp',
    element: (
      <AmberAuthLayout>
        <OTPPage />
      </AmberAuthLayout>
    )
  }
];

export default authRoutes;
