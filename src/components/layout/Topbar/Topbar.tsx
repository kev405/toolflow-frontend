import { SearchBar } from '../Topbar/components/SearchBar';
import { AlertsDropdown } from '../Topbar/components/AlertsDropdown';
import { UserAvatar } from '../Topbar/components/UserAvatar';

export interface TopbarProps {
  onMenuToggle: () => void;
}

export const Topbar = ({ onMenuToggle }: TopbarProps) => {
  const defaultAlerts = [
    {
      icon: 'file-alt',
      iconBg: 'primary',
      date: '12 Diciembre, 2023',
      message: '¡Hay un nuevo reporte mensual disponible para descargar!'
    },
    {
      icon: 'donate',
      iconBg: 'success',
      date: '7 Diciembre, 2023',
      message: '¡Se han depositado $290.29 en tu cuenta!'
    }
  ];

  return (
    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
      {/* Botón para alternar sidebar (mobile) */}
      <button 
        className="btn btn-link d-md-none rounded-circle mr-3"
        onClick={onMenuToggle}
        aria-label="Alternar menú"
      >
        <i className="fa fa-bars"></i>
      </button>

      {/* Navegación superior */}
      <ul className="navbar-nav ml-auto">
        
        {/* Componente Alertas */}
        <AlertsDropdown alerts={defaultAlerts} />

        <div className="topbar-divider d-none d-sm-block"></div>

        {/* Componente Avatar */}
        <UserAvatar />
      </ul>
    </nav>
  );
};