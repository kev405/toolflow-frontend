import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'my-secret-key';

export const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Redirección y bloqueo de estudiantes
  const handleLoginRedirect = (user: any) => {
    if (!user || !user.role) return '/login';
    const roles = user.role.map((r: any) => r.authority);
    if (roles.includes('STUDENT')) return 'BLOCKED';
    if (roles.includes('ADMINISTRATOR')) return '/tools';
    if (roles.includes('TOOL_ADMINISTRATOR')) return '/loans';
    if (roles.includes('TEACHER')) return '/loans';
    return '/tools';
  };

  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const encryptedPassword = localStorage.getItem('rememberedPassword');

    if (savedUsername && encryptedPassword) {
      setUsername(savedUsername);

      const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY).toString(CryptoJS.enc.Utf8);
      setPassword(decryptedPassword);

      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login({ username, password });
      if (!result.success) {
        setError(result.error || 'Credenciales inválidas');
        return;
      }

      // Bloquear estudiantes
      const redirect = handleLoginRedirect(result.user);
      if (redirect === 'BLOCKED') {
        navigate('/404', { replace: true });
        return;
      }

      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
        const encryptedPassword = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
        localStorage.setItem('rememberedPassword', encryptedPassword);
      } else {
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberedPassword');
      }

      navigate(redirect);
    } catch (err) {
      setError('Error de conexión. Por favor intente nuevamente.');
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
            type="text"
            className="form-control form-control-user"
            id="username"
            aria-describedby="usernameHelp"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
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
            autoComplete="current-password"
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
    </div>
  );
};