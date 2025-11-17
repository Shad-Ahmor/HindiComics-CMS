import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Configure axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Response interceptor
// Pass token as an argument to each request config
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Extract token from the config you pass per request
    const token = error.config?.headers?.Authorization?.split(" ")[1];

    if (!token || error.response?.status === 401) {
      console.error("Token is missing or expired");

      try {
        await axios.post(
         `${API_BASE_URL}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (logoutError) {
        console.error("Error during logout API call:", logoutError);
      }

      // Clear session only if needed
      // localStorage.clear(); // optional if you use sessionRef
    }

    return Promise.reject(error);
  }
);

export default api;
