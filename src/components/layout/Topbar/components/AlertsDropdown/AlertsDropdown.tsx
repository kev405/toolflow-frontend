import { useState, useRef, useEffect } from 'react';

interface AlertItem {
  icon: string;
  iconBg: string;
  date: string;
  message: string;
}

interface AlertsDropdownProps {
  alerts?: AlertItem[];
}

export const AlertsDropdown = ({ alerts = [] }: AlertsDropdownProps) => {
  const [alertsOpen, setAlertsOpen] = useState(false);
  const alertsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setAlertsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleAlerts = () => setAlertsOpen(!alertsOpen);

  return (
    <li className={`nav-item dropdown no-arrow mx-1 ${alertsOpen ? 'show' : ''}`}>
      <a 
        className="nav-link dropdown-toggle" 
        href="#" 
        role="button"
        onClick={toggleAlerts}
      >
        <i className="fas fa-bell fa-fw"></i>
        {alerts.length > 0 && (
          <span className="badge badge-danger badge-counter">{alerts.length}+</span>
        )}
      </a>
      <div 
        ref={alertsRef}
        className={`dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in ${alertsOpen ? 'show' : ''}`}
      >
        <h6 className="dropdown-header">
          Centro de Alertas
        </h6>
        {alerts.map((alert) => (
          <a key={alert.id} className="dropdown-item d-flex align-items-center" href="#">
            <div className="mr-3">
              <div className={`icon-circle bg-${alert.iconBg}`}>
                <i className={`fas fa-${alert.icon} text-white`}></i>
              </div>
            </div>
            <div>
              <div className="small text-gray-500">{alert.date}</div>
              <span className="font-weight-bold">{alert.message}</span>
            </div>
          </a>
        ))}
        <a className="dropdown-item text-center small text-gray-500" href="#">
          Ver todas las alertas
        </a>
      </div>
    </li>
  );
};