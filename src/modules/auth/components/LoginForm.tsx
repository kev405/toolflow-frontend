import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useState } from 'react';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError('Credenciales inválidas. Por favor intente nuevamente.');
      console.error('Error de inicio de sesión:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5">
      <div className="text-center">
        <h1 className="h4 text-gray-900 mb-4">¡Bienvenido de nuevo!</h1>
      </div>
      
      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}

      <form className="user" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            className="form-control form-control-user"
            id="email"
            aria-describedby="emailHelp"
            placeholder="Ingrese su correo electrónico..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            className="form-control form-control-user"
            id="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <div className="custom-control custom-checkbox small">
            <input
              type="checkbox"
              className="custom-control-input"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label className="custom-control-label" htmlFor="rememberMe">
              Recordar mis datos
            </label>
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-user btn-block"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>
      
      {/* <LoginFooter /> */}
    </div>
  );
};

const LoginFooter = () => (
  <>
    <hr />
    <div className="text-center">
      <a className="small" href="/forgot-password">
        ¿Olvidó su contraseña?
      </a>
    </div>
  </>
);