import axios from "axios";
import { useAuthStore } from "../store/useStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add request interceptor to attach token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 globally
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid, logout
      localStorage.removeItem("token");
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default instance;
