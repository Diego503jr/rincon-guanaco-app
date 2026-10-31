// Todas las rutas del backend. Nadie escribe URLs sueltas en las pantallas.
export const ENDPOINTS = {
  auth: {
    login: "/login",
    register: "/register",
    me: "/me",
    logout: "/logout",
  },
  destinations: {
    list: "/destinations",
    detail: (id) => `/destinations/${id}`,
  },
  reviews: {
    list: "/reviews",
    create: "/reviews",
  },
  itineraries: {
    list: "/itineraries",
    detail: (id) => `/itineraries/${id}`,
  },
};
