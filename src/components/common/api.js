import axios from "axios";

// Configure axios instance
const api = axios.create({
  baseURL: "http://localhost:5000",
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
          "http://localhost:5000/auth/logout",
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
