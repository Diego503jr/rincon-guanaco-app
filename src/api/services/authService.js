import api from "../client";
import { ENDPOINTS } from "../endpoints";

export const authService = {
  // Debe devolver { token, user }
  login: async (credentials) => {
    const { data } = await api.post(ENDPOINTS.auth.login, credentials);
    return data;
  },

  register: async (payload) => {
    const { data } = await api.post(ENDPOINTS.auth.register, payload);
    return data;
  },

  me: async () => {
    const { data } = await api.get(ENDPOINTS.auth.me);
    return data.user ?? data;
  },

  logout: async () => {
    await api.post(ENDPOINTS.auth.logout);
  },
};
