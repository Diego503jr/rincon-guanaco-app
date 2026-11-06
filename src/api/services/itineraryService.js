import api from "../client";
import { ENDPOINTS } from "../endpoints";

// CRUD de itinerarios y de las actividades dentro de cada itinerario
export const itineraryService = {
  // ===== Itinerarios =====

  // Mis itinerarios (solo los del usuario con sesión)
  getAll: async () => {
    const { data } = await api.get(ENDPOINTS.itineraries.list);
    return data;
  },

  // Detalle con las actividades agrupadas por día: 
  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.itineraries.detail(id));
    return data;
  },

  // payload: { title }
  create: async (payload) => {
    const { data } = await api.post(ENDPOINTS.itineraries.list, payload);
    return data;
  },

  // payload: { title } y/o { is_completed: true }
  update: async (id, payload) => {
    const { data } = await api.patch(ENDPOINTS.itineraries.detail(id), payload);
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(ENDPOINTS.itineraries.detail(id));
    return data;
  },

  // ===== Actividades del itinerario =====

  // Actividades activas para elegir en el modal (params opcional: { destination_id })
  getAvailableActivities: async (params) => {
    const { data } = await api.get(ENDPOINTS.itineraries.available, { params });
    return data;
  },

  // payload: { activity_id, date_time: "YYYY-MM-DD HH:mm", people, title? }
  addActivity: async (id, payload) => {
    const { data } = await api.post(ENDPOINTS.itineraries.activities(id), payload);
    return data;
  },

  // payload: { title?, date_time?, people? }
  updateActivity: async (id, itemId, payload) => {
    const { data } = await api.patch(
      ENDPOINTS.itineraries.activity(id, itemId),
      payload,
    );
    return data;
  },

  removeActivity: async (id, itemId) => {
    const { data } = await api.delete(ENDPOINTS.itineraries.activity(id, itemId));
    return data;
  },
  
  // ===== Alojamientos del itinerario =====
  // payload: { accommodation_id, check_in: "YYYY-MM-DD", check_out: "YYYY-MM-DD", guests }
  addAccommodation: async (id, payload) => {
    const { data } = await api.post(ENDPOINTS.itineraries.accommodations(id), payload);
    return data;
  },

  // payload: { check_in?, check_out?, guests? }
  updateAccommodation: async (id, itemId, payload) => {
    const { data } = await api.patch(
      ENDPOINTS.itineraries.accommodation(id, itemId),
      payload,
    );
    return data;
  },

  removeAccommodation: async (id, itemId) => {
    const { data } = await api.delete(ENDPOINTS.itineraries.accommodation(id, itemId));
    return data;
  },
};