export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;
export const config = {
  API_BASE_URL,
  AUTH_ENDPOINTS: {
    authenticate: `${API_BASE_URL}/auth/authenticate`,
    validateToken: `${API_BASE_URL}/auth/validate-token`
  },
  SECRET_KEY,
};