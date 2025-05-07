import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';
import { Footer } from '../../components/layout/Footer';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import './MainLayout.css';

export const MainLayout = () => {
  const { loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Cerrar automáticamente el sidebar en móvil al cambiar de tamaño
      if (mobile) {
        setSidebarCollapsed(true);
        setShowOverlay(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      // En móvil, alternar también el overlay
      if (isMobile) {
        setShowOverlay(!prev);
      }
      return !prev;
    });
  };

  const handleOverlayClick = () => {
    setSidebarCollapsed(true);
    setShowOverlay(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={toggleSidebar}
        showOverlay={showOverlay}
        overlayClick={handleOverlayClick}
      />
      
      <div 
        className={`main-content-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
        style={{ 
          width: sidebarCollapsed ? '100%' : 'calc(100% - 14rem)',
        }}
      >
        <Topbar 
          onMenuToggle={toggleSidebar}
        />
        
        <div className="content-container">
          <main className="main-content">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};