import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const PublicRoute = () => {
  const { isAuthenticated } = useAuth();

  // return !isAuthenticated ? <Outlet /> : <Navigate to="/tools" replace />;
  return false ? <Outlet /> : <Navigate to="/tools" replace />;
};