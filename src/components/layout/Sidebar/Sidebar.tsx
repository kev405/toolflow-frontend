import { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import './Sidebar.css';

interface SidebarProps {
  brandName?: string;
  brandIcon?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
  navItems?: {
    to: string;
    icon: string;
    text: string;
  }[];
  user?: {
    name: string;
    avatar?: string;
  };
  showOverlay?: boolean;
  overlayClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  brandName = 'ToolFlow',
  brandIcon = 'cog',
  isCollapsed = false,
  onToggle,
  navItems = [
    { to: '/loans', icon: 'hand-holding-usd', text: 'Préstamos' },
    { to: '/vehicles', icon: 'car', text: 'Vehículos' },
    { to: '/tools', icon: 'tools', text: 'Herramientas' },
    { to: '/transfers', icon: 'exchange-alt', text: 'Traslados' },
    { to: '/users', icon: 'users', text: 'Usuarios' },
  ],
  user,
  showOverlay = false,
  overlayClick,
}) => {
  const { user: authUser } = useAuth();
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);

  const handleResize = useCallback(() => {
    const isMobile = window.innerWidth < 768;
    setMobileView(isMobile);
  }, []);

  const handleOverlayClick = useCallback(() => {
    if (onToggle) {
      onToggle();
    }
  }, [onToggle]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const handleNavLinkClick = useCallback(() => {
    if (mobileView && onToggle) {
      onToggle();
    }
  }, [mobileView, onToggle]);

  return (
    <>
      {showOverlay && (
        <div 
          className="sidebar-overlay"
          onClick={overlayClick || handleOverlayClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1040,
            display: (!isCollapsed && mobileView) ? 'block' : 'none',
          }}
        />
      )}

      <aside 
        className={`sidebar ${isCollapsed ? 'toggled' : ''}`}
        style={{
          width: isCollapsed ? (mobileView ? '0' : '6.5rem') : '14rem',
          minWidth: isCollapsed ? (mobileView ? '0' : '6.5rem') : '14rem',
          height: '100vh',
          position: mobileView ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          overflowY: 'auto',
        }}
      >
        <div className="sidebar-brand">
          <i className={`fas fa-${brandIcon}`} />
          {!isCollapsed && <span className="sidebar-brand-text">{brandName}</span>}
        </div>

        <div className="sidebar-divider" />

        <nav>
          <ul style={{ listStyle: 'none', padding: '0 1rem' }}>
            {navItems.map((item) => {
              if (item.to === '/vehicles' && !authUser?.role.some((r) => r.authority)) {
                return null;
              }

              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className="nav-link"
                    onClick={handleNavLinkClick}
                    title={isCollapsed ? item.text : ''}
                  >
                    <i className={`fas fa-${item.icon}`} />
                    {!isCollapsed && <span>{item.text}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {user && !isCollapsed && (
          <>
            <div className="sidebar-divider" />
            <div style={{ 
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <img 
                src={user.avatar || '/default-avatar.png'} 
                alt={user.name}
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <div style={{ fontSize: '0.9rem' }}>{user.name}</div>
            </div>
          </>
        )}

        {onToggle && (
          <>
            <div className="sidebar-divider" />
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <button 
                onClick={onToggle}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
                aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
              >
                <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`} />
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};