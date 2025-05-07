export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9009';

export const config = {
  API_BASE_URL,
  AUTH_ENDPOINTS: {
    authenticate: `${API_BASE_URL}/auth/authenticate`,
    validateToken: `${API_BASE_URL}/auth/validate-token`
  }
};