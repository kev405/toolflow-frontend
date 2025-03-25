import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';
import { Footer } from '../../components/layout/Footer';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const MainLayout = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">

      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>


      <div className="flex flex-1 flex-col overflow-hidden">

        <Topbar />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};