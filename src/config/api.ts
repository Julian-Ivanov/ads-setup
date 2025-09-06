// API configuration for different environments
const getApiBaseUrl = () => {
  // In production, the backend will be served from the same domain
  if (import.meta.env.PROD) {
    return ''; // Same domain as frontend
  }
  // In development, use localhost
  return 'http://localhost:3001';
};

export const API_BASE_URL = getApiBaseUrl();
