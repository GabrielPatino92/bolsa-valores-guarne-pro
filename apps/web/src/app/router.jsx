import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/shared/layout/AppLayout.jsx';
import HomePage from '@/features/home/pages/HomePage.jsx';
import LoginPage from '@/features/auth/pages/LoginPage.jsx';
import DashboardPage from '@/features/dashboard/pages/DashboardPage.jsx';
import BacktestingPage from '@/features/backtesting/pages/BacktestingPage.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'backtesting', element: <BacktestingPage /> }
    ]
  }
]);
