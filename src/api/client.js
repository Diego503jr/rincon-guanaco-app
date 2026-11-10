import axios from "axios";
import { storage } from "./storage";
import { ENDPOINTS } from "./endpoints";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.13:8000/api";

// El UserContext registra aquí qué hacer cuando el token ya no sirve
let onUnauthorized = null;
let handlingUnauthorized = false;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Adjunta el Bearer token en TODAS las peticiones
api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el servidor responde 401, se cierra la sesión local
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error.config?.url;
    const isAuthRoute =
      url === ENDPOINTS.auth.login || url === ENDPOINTS.auth.register;

    if (
      (error.response?.status === 401 && !isAuthRoute && onUnauthorized) ||
      !handlingUnauthorized
    ) {
      handlingUnauthorized = true

      try {
        await onUnauthorized();
      } finally {
        handlingUnauthorized = false
      }
    }
    return Promise.reject(error);
  },
);

export default api;
