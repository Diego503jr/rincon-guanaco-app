// Todas las rutas del backend. Nadie escribe URLs sueltas en las pantallas.
export const ENDPOINTS = {
  auth: {
    login: "/login",
    register: "/register",
    me: "/me",
    logout: "/logout",
  },
  destinations: {
    list: "/admin/destinations",
    detail: (id) => `/destinations/${id}`,
    visitedDestinations: "/user/visited-destinations",
  },
  activities: {
    list: "/admin/activities",
    detail: (id) => `/destinations/${id}`,
  },
  accommodations: {
    list: "/admin/accommodations",
    detail: (id) => `/destinations/${id}`,
  },
  reviews: {
    list: "/reviews",
    create: "/reviews",
    report: "/reviews/report",
  },
  itineraries: {
    list: "/itineraries",
    detail: (id) => `/itineraries/${id}`,
    activities: (id) => `/itineraries/${id}/activities`,
    activity: (id, itemId) => `/itineraries/${id}/activities/${itemId}`,
    available: "/activities", // actividades activas para el modal (?destination_id=)
  },
};