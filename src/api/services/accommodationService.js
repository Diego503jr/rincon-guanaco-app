import api from "../client";
import { ENDPOINTS } from "../endpoints";

export const accommodationService = {
  getByDestination: async (destinationId) => {
    const { data } = await api.get(`/destinations/${destinationId}/accommodations`);
    return data?.data ?? data ?? [];
  },
};