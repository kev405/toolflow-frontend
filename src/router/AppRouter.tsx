import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './components/PrivateRoute';
import { PublicRoute } from './components/PublicRoute';
import { LoadingSpinner } from '../components/LoadingSpinner/LoadingSpinner';
import { ErrorPage } from '../modules/error/pages/ErrorPage';
import { MainLayout } from '../layouts/MainLayout/MainLayout';

// Public components
const Login = lazy(() => import('../modules/auth/pages/LoginPage'));

// Private components
const Tools = lazy(() => import('../modules/tools/pages/ToolsPage'));
const Loans = lazy(() => import('../modules/loans/pages/LoansPage'));
const Profile = lazy(() => import('..//modules/profile/pages/ProfilePage'));
const Transfers = lazy(() => import('../modules/transfers/pages/TransfersPage'));
const Users = lazy(() => import('../modules/users/pages/UsersPage'));
const Vehicles = lazy(() => import('../modules/vehicles/pages/VehiclesPage'));

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>

            {/* Redirect / to /tools */}
            <Route path="/" element={<Navigate to="/tools" replace />} />
            
            <Route path="/tools" element={<Tools />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/users" element={<Users />} />
            <Route path="/vehicles" element={<Vehicles />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
}