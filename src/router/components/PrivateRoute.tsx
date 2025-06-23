import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spin } from 'antd';

const getAllowedPrefixes = (roles: string[]): string[] => {
  if (roles.includes('ADMINISTRATOR')) return ['/tools', '/loans', '/profile', '/transfers', '/users', '/vehicles', '/headquarter'];
  if (roles.includes('TOOL_ADMINISTRATOR')) return ['/tools', '/loans', '/profile', '/transfers', '/vehicles'];
  if (roles.includes('TEACHER')) return ['/loans', '/profile'];
  return [];
};

export const PrivateRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const roles = user.role.map((r) => r.authority);
  if (roles.includes('STUDENT')) return <Navigate to="/404" replace />;

  const allowedPrefixes = getAllowedPrefixes(roles);
  const currentPath = location.pathname === '/' ? '/tools' : location.pathname;
  const isAllowed = allowedPrefixes.some(prefix => currentPath === prefix || currentPath.startsWith(prefix + '/'));
  if (!isAllowed) {
    // Redirigir a la ruta inicial permitida
    if (roles.includes('ADMINISTRATOR')) return <Navigate to="/tools" replace />;
    if (roles.includes('TOOL_ADMINISTRATOR')) return <Navigate to="/loans" replace />;
    if (roles.includes('TEACHER')) return <Navigate to="/loans" replace />;
    return <Navigate to="/404" replace />;
  }

  return <Outlet />;
};