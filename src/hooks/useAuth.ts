import { useState, useEffect, useCallback } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';

// Tipos de TypeScript
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  error?: string;
  token?: string;
  user?: User;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

interface AuthActions {
  login: (credentials: AuthCredentials) => Promise<AuthResponse>;
  logout: () => void;
  validateToken: (token: string) => Promise<boolean>;
}

type UseAuthHook = AuthState & AuthActions;

// Implementación del hook
export const useAuth = (): UseAuthHook => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  const navigate: NavigateFunction = useNavigate();

  // Función para guardar la sesión en localStorage
  const persistAuth = useCallback((token: string, user: User): void => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
  }, []);

  // Función para limpiar la sesión
  const clearAuth = useCallback((): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }, []);

  // Validar token al cargar la app
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        try {
          const isValid = await validateToken(token);
          console.log("🚀 ~ initializeAuth ~ isValid:", isValid)
          
          if (isValid) {
            setAuthState({
              isAuthenticated: true,
              user: JSON.parse(userData),
              loading: false
            });
            return;
          }
        } catch (error) {
          console.error('Error validating token:', error);
        }
      }

      setAuthState(prev => ({ ...prev, loading: false }));
    };

    initializeAuth();
  }, []);

  // Función para validar token (simulada)
  const validateToken = async (token: string): Promise<boolean> => {
    // Aquí iría la validación real con tu backend
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(!!token);
      }, 500);
    });
  };

  // Función de login
  const login = async (credentials: AuthCredentials): Promise<AuthResponse> => {
    try {
      // Simulación de API call - reemplazar con tu implementación real
      const response = await mockLoginApi(credentials);
      
      if (response.success && response.token && response.user) {
        persistAuth(response.token, response.user);
        
        setAuthState({
          isAuthenticated: true,
          user: response.user,
          loading: false
        });

        navigate('/tools');
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  // Función de logout
  const logout = (): void => {
    clearAuth();
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
    navigate('/login');
  };

  // Mock API (reemplazar con tu implementación real)
  const mockLoginApi = async (credentials: AuthCredentials): Promise<AuthResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (credentials.email === 'admin@example.com' && credentials.password === '123456') {
          resolve({
            success: true,
            token: 'fake-jwt-token',
            user: {
              id: 1,
              name: 'Admin',
              email: 'admin@example.com',
              role: 'admin'
            }
          });
        } else {
          resolve({
            success: false,
            error: 'Credenciales inválidas'
          });
        }
      }, 1000);
    });
  };

  return {
    ...authState,
    login,
    logout,
    validateToken
  };
};