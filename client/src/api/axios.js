import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "devconnect1.up.railway.app";

const instance = axios.create({
  baseURL: API_URL,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default instance;
