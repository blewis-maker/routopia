import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import LandingPage from '@/pages/LandingPage';
import MainAppPage from '@/pages/app/MainAppPage';
import RoutePlanningPage from '@/pages/app/RoutePlanningPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout showHeader={false} />,
    children: [
      {
        index: true,
        element: <LandingPage />
      }
    ]
  },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <MainAppPage />
      },
      {
        path: 'route',
        element: <RoutePlanningPage />
      },
      {
        path: 'route/:routeId',
        element: <RoutePlanningPage />
      }
    ]
  }
]); 