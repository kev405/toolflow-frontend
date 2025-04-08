import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const PublicRoute = () => {
  const { isAuthenticated } = useAuth();

  // return !isAuthenticated ? <Outlet /> : <Navigate to="/tools" replace />;
  //return true ? <Outlet /> : <Navigate to="/tools" replace />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/users" replace />;
};