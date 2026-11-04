import api from "../client";
import { ENDPOINTS } from "../endpoints";

export const activityService = {
  getByDestination: async (destinationId) => {
    const { data } = await api.get(`/destinations/${destinationId}/activities`);
    
    const rawList = data?.data ?? data ?? [];
    return rawList.map(item => ({
      ...item,
      name: item.activity_name || item.name,
      description: item.notes || item.description || 'Sin notas adicionales',
    }));
  },
};