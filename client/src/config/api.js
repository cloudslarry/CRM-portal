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