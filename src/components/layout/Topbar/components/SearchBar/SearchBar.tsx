import { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  isMobile?: boolean;
}

export const SearchBar = ({ isMobile = false }: SearchBarProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSearch = () => setSearchOpen(!searchOpen);

  if (isMobile) {
    return (
      <li className={`nav-item dropdown no-arrow d-sm-none ${searchOpen ? 'show' : ''}`}>
        <a 
          className="nav-link dropdown-toggle" 
          href="#" 
          role="button"
          onClick={toggleSearch}
        >
          <i className="fas fa-search fa-fw"></i>
        </a>
        <div 
          ref={searchRef}
          className={`dropdown-menu dropdown-menu-right p-3 shadow animated--grow-in ${searchOpen ? 'show' : ''}`}
        >
          <form className="form-inline mr-auto w-100 navbar-search">
            <div className="input-group">
              <input 
                type="text" 
                className="form-control bg-light border-0 small"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="input-group-append">
                <button className="btn btn-primary" type="button">
                  <i className="fas fa-search fa-sm"></i>
                </button>
              </div>
            </div>
          </form>
        </div>
      </li>
    );
  }

  return (
    <form className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
      <div className="input-group">
        <input 
          type="text" 
          className="form-control bg-light border-0 small" 
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="input-group-append">
          <button className="btn btn-primary" type="button">
            <i className="fas fa-search fa-sm"></i>
          </button>
        </div>
      </div>
    </form>
  );
};