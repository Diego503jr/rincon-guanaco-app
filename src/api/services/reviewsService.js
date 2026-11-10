import client from '../../api/client';
import { ENDPOINTS } from "../endpoints";

// Obtiene la lista de reseñas, con filtros de búsqueda, tipo de viajero y cercanía
export const getReviews = async (placeName = '', travelerType = 'Todos', isNearby = false, lat = null, lng = null) => {
  try {
    // Construimos los parámetros dinámicamente
    const queryParams = {};

    if (placeName) queryParams.search = placeName;
    
    // Si el tipo de viajero no es 'Todos', lo enviamos
    if (travelerType !== 'Todos') {
      queryParams.traveler_type = travelerType;
    }
    
    // Si la cercanía está activa y tenemos coordenadas, las enviamos
    if (isNearby && lat && lng) {
      queryParams.nearby = 'true';
      queryParams.latitude = lat;
      queryParams.longitude = lng;
    }

    const response = await client.get(ENDPOINTS.reviews.list, { 
      params: queryParams 
    });
    
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error al obtener reseñas:", error);
    throw error;
  }
};

// Crea una nueva reseña con los datos proporcionados.
export const postReview = async (reviewData) => {
  try {
    const response = await client.post(ENDPOINTS.reviews.create, reviewData);
    return response.data;
  } catch (error) {
    console.error("Error al crear reseña:", error);
    throw error;
  }
};

// Reporta una reseña existente
export const reportReview = async (reportData) => {
  try {
    const response = await client.post(ENDPOINTS.reviews.report, reportData);
    return response.data;
  } catch (error) {
    console.error("Error al reportar reseña:", error);
    throw error;
  }
};

// Obtiene el listado de destinos visitados por el usuario para que pueda crear reseña
export const getVisitedDestinations = async () => {
  try {
    const response = await client.get(ENDPOINTS.destinations.visitedDestinations);
    return response.data;
  } catch (error) {
    console.error("Error al obtener destinos visitados:", error);
    throw error;
  }
};