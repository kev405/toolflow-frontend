import { jwtDecode } from 'jwt-decode';
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';

interface User {
  id: string;
  username: string;
  name: string;
  role: { authority: string }[];
}

interface AuthCredentials {
  username: string;
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

const AUTH_ENDPOINTS = {
  authenticate: `${API_BASE_URL}/auth/authenticate`,
  validateToken: `${API_BASE_URL}/auth/validate-token`
};

export const useAuth = (): UseAuthHook => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  const getUserFromToken = useCallback((token: string): User | null => {
    try {
      const decoded: any = jwtDecode(token);
      return {
        id: decoded.userId || decoded.sub,
        username: decoded.username || decoded.sub,
        name: decoded.name || '',
        role: decoded.role || [{ authority: 'user' }]
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }, []);

  const clearAuth = useCallback((): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }, []);

  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return false;
      }

      const response = await fetch(`${AUTH_ENDPOINTS.validateToken}?jwt=${encodeURIComponent(token)}`, {
        method: 'GET',
      });

      return response.ok;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');

      if (token) {
        try {
          const isValid = await validateToken(token);

          if (isValid) {
            const user = userData ? JSON.parse(userData) : getUserFromToken(token);
            setAuthState({
              isAuthenticated: true,
              user,
              loading: false
            });
            return;
          }
        } catch (error) {
          console.error('Error validating token:', error);
        }
        clearAuth();
      }

      setAuthState((prev) => ({ ...prev, loading: false }));
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: AuthCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch(AUTH_ENDPOINTS.authenticate, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Authentication failed'
        };
      }

      if (data.jwt) {
        localStorage.setItem('authToken', data.jwt);
        const user = getUserFromToken(data.jwt);

        if (!user) {
          return {
            success: false,
            error: 'Invalid token structure'
          };
        }

        setAuthState({
          isAuthenticated: true,
          user,
          loading: false
        });

        return {
          success: true,
          token: data.jwt,
          user
        };
      }

      return {
        success: false,
        error: 'No token received'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }, [getUserFromToken]);

  const logout = useCallback((): void => {
    clearAuth();
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
  }, [clearAuth]);

  return {
    ...authState,
    login,
    logout,
    validateToken
  };
};