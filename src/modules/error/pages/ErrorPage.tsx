import { Link } from 'react-router-dom';

export const ErrorPage = () => {
  return (
    <div className="container-fluid vh-100 d-flex flex-column justify-content-center">
      <div className="text-center">
        <div 
          className="error mx-auto" 
          data-text="404"
          style={{ fontSize: '7rem', color: '#5a5c69' }}
        >
          404
        </div>
        <p className="lead text-gray-800 mb-5">Página No Encontrada</p>
        <Link 
          to="/" 
          className="btn btn-primary mt-3 px-4 py-2"
          style={{ borderRadius: '2rem' }}
        >
          &larr; Volver al Panel Principal
        </Link>
      </div>
    </div>
  );
};