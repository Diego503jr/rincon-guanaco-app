import api from "../client";
import { ENDPOINTS } from "../endpoints";

// Perfil del usuario (pantalla "Mi Perfil")
export const profileService = {
  // payload: { name, email, phone, traveler_type, country_of_origin } -> devuelve el usuario actualizado
  update: async (payload) => {
    const { data } = await api.put(ENDPOINTS.profile.update, payload);
    return data.user;
  },

  // payload: { current_password, password, password_confirmation }
  changePassword: async (payload) => {
    const { data } = await api.put(ENDPOINTS.profile.password, payload);
    return data;
  },
};