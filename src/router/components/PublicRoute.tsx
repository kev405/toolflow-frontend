import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spin } from 'antd';

export const PublicRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Si el usuario es estudiante, bloquear acceso a login y mostrar 404
  if (user && user.role && user.role.some((r) => r.authority === 'STUDENT')) {
    return <Navigate to="/404" replace />;
  }

  // Redirección según rol
  if (isAuthenticated && user && user.role) {
    const roles = user.role.map((r) => r.authority);
    if (roles.includes('ADMINISTRATOR')) return <Navigate to="/tools" replace />;
    if (roles.includes('TOOL_ADMINISTRATOR')) return <Navigate to="/loans" replace />;
    if (roles.includes('TEACHER')) return <Navigate to="/loans" replace />;
  }

  return !isAuthenticated ? <Outlet /> : <Navigate to="/tools" replace />;
};