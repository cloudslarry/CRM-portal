import axios from "axios";

// Create an Axios instance WITHOUT a baseURL.
// This is the most important change. It allows the proxy in your
// package.json file to handle the requests correctly during development.
const api = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor for debugging (this is very useful)
api.interceptors.request.use(
  (config) => {
    // The URL will now be relative, e.g., "/api/student/login"
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // DEBUG: Log authorization header for troubleshooting
    if (config.headers.Authorization) {
      console.log('Authorization header:', config.headers.Authorization.substring(0, 20) + '...');
      
      // FIXED: Validate JWT token format before sending request
      const token = config.headers.Authorization.replace('Bearer ', '');
      const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
      
      if (!jwtPattern.test(token)) {
        console.error('Invalid JWT token detected in request, clearing...');
        delete config.headers.Authorization;
        // Clear invalid tokens from localStorage
        localStorage.removeItem('studentToken');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('facultyToken');
      }
    } else {
      console.log('No Authorization header found');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling (also useful)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;