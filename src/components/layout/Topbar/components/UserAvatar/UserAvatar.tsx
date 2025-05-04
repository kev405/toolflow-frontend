import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserAvatarProps {
  user?: {
    name: string;
    avatar?: string;
  };
}

export const UserAvatar = ({
  user = { name: 'Usuario', avatar: 'https://startbootstrap.github.io/startbootstrap-sb-admin-2/img/undraw_profile.svg' }
}: UserAvatarProps) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/profile');
    setUserMenuOpen(false);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  return (
    <li className={`nav-item dropdown no-arrow ${userMenuOpen ? 'show' : ''}`}>
      <a
        className="nav-link dropdown-toggle"
        href="#"
        role="button"
        onClick={toggleUserMenu}
      >
        <span className="mr-2 d-none d-lg-inline text-gray-600 small">{user.name}</span>
        <img
          className="img-profile rounded-circle"
          src={user.avatar}
          alt="Usuario"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://startbootstrap.github.io/startbootstrap-sb-admin-2/img/undraw_profile.svg';
          }}
        />
      </a>
      <div
        ref={userMenuRef}
        className={`dropdown-menu dropdown-menu-right shadow animated--grow-in ${userMenuOpen ? 'show' : ''}`}
      >
        <a
          className="dropdown-item"
          href="#"
          onClick={handleProfileClick}
        >
          <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
          Perfil
        </a>
        <div className="dropdown-divider"></div>
        <a
          className="dropdown-item"
          href="#"
          onClick={handleLogout} // Llama a la función handleLogout
        >
          <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
          Cerrar sesión
        </a>
      </div>
    </li>
  );
};