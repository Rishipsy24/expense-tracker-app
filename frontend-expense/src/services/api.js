import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL;

if (!configuredApiUrl) {
  throw new Error('VITE_API_URL must be configured for the frontend build.');
}

// The Express routes are mounted beneath /api. Normalising here prevents a
// deployment variable such as https://example.onrender.com from producing
// requests to the non-existent /auth/* routes.
const apiBaseUrl = `${configuredApiUrl.replace(/\/$/, '')}${configuredApiUrl.replace(/\/$/, '').endsWith('/api') ? '' : '/api'}`;

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      // Redirect to login handled in AuthContext or App
    }
    return Promise.reject(error);
  }
);

export default api;
