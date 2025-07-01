import { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import './Sidebar.css';

interface SidebarProps {
  brandName?: string;
  brandIcon?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
  navItems?: (SidebarItem | SidebarItemWithSubmenu)[];
  user?: {
    name: string;
    avatar?: string;
  };
  showOverlay?: boolean;
  overlayClick?: () => void;
}

interface SidebarItem {
  to: string;
  icon: string;
  text: string;
}

interface SidebarItemWithSubmenu {
  icon: string;
  text: string;
  submenu: SidebarItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  brandName = 'ToolFlow',
  brandIcon = 'cog',
  isCollapsed = false,
  onToggle,  navItems = [
    { to: '/loans', icon: 'hand-holding-usd', text: 'Préstamos' },
    {
      icon: 'car',
      text: 'Vehículos',
      submenu: [
        { to: '/vehicles', icon: 'car', text: 'Vehículos' },
        { to: '/vehicle-parts', icon: 'cogs', text: 'Partes' },
      ],
    },
    { to: '/tools', icon: 'tools', text: 'Herramientas' },
    { to: '/transfers', icon: 'exchange-alt', text: 'Traslados' },
    { to: '/users', icon: 'users', text: 'Usuarios' },
    { to: '/headquarter', icon: 'building', text: 'Sedes' },
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
  // Filtrar ítems del menú según el rol
  const getNavItemsByRole = () => {
    if (!authUser || !authUser.role) return navItems;
    const roles = authUser.role.map((r) => r.authority);
    if (roles.includes('ADMINISTRATOR')) return navItems;
    
    return navItems.filter(item => {
      // Si el item tiene submenu, filtrar sus elementos
      if ('submenu' in item) {
        const filteredSubmenu = item.submenu.filter(subItem => {
          if (roles.includes('TOOL_ADMINISTRATOR')) {
            return subItem.to !== '/users' && subItem.to !== '/headquarter';
          }
          if (roles.includes('TEACHER')) {
            return subItem.to === '/loans';
          }
          return true;
        });
        return filteredSubmenu.length > 0;
      }
      
      // Para items simples
      if (roles.includes('TOOL_ADMINISTRATOR')) {
        return item.to !== '/users' && item.to !== '/headquarter';
      }
      if (roles.includes('TEACHER')) {
        return item.to === '/loans';
      }
      return true;
    });
  };

  const filteredNavItems = getNavItemsByRole();

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
            {filteredNavItems.map((item, idx) => {
              // Check if item is SidebarItemWithSubmenu
              if ('submenu' in item && Array.isArray(item.submenu)) {
                return (
                  <li key={`submenu-${item.text}-${idx}`}>
                    <div className="nav-link" title={isCollapsed ? item.text : ''}>
                      <i className={`fas fa-${item.icon}`} />
                      {!isCollapsed && <span>{item.text}</span>}
                    </div>
                    <ul style={{ listStyle: 'none', paddingLeft: isCollapsed ? 0 : '1.5rem' }}>
                      {item.submenu.map((subItem) => (
                        <li key={subItem.to}>
                          <NavLink
                            to={subItem.to}
                            className="nav-link"
                            onClick={handleNavLinkClick}
                            title={isCollapsed ? subItem.text : ''}
                          >
                            <i className={`fas fa-${subItem.icon}`} />
                            {!isCollapsed && <span>{subItem.text}</span>}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              } else {
                // SidebarItem
                const simpleItem = item as SidebarItem;
                return (
                  <li key={simpleItem.to}>
                    <NavLink
                      to={simpleItem.to}
                      className="nav-link"
                      onClick={handleNavLinkClick}
                      title={isCollapsed ? simpleItem.text : ''}
                    >
                      <i className={`fas fa-${simpleItem.icon}`} />
                      {!isCollapsed && <span>{simpleItem.text}</span>}
                    </NavLink>
                  </li>
                );
              }
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