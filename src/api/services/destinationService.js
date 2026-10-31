import api from "../client";
import { ENDPOINTS } from "../endpoints";

export const destinationService = {
  getAll: async (params) => {
    const { data } = await api.get(ENDPOINTS.destinations.list, { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(ENDPOINTS.destinations.detail(id));
    return data;
  },
};
