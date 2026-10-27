// ===== Colores (paleta oficial de la guía) =====
export const COLORS = {
  primary: '#0D2A4D',    // Azul Añil Profundo: headers, navegación, títulos
  accent: '#F26419',     // Naranja Atardecer: botones CTA, marcadores, alertas
  secondary: '#2A9D8F',  // Verde Palmera: badges, clima, iconos
  background: '#F8F9FA', // Blanco Hueso: fondo de pantallas
  text: '#212529',       // Gris Carbón: cuerpo de texto

  // Auxiliares (no vienen en la guía, ajústalos si hace falta)
  white: '#FFFFFF',
  border: '#E9ECEF',
  textMuted: '#6C757D',
};

// ===== Fuentes =====
// Estos nombres son los que registra @expo-google-fonts
export const FONTS = {
  heading: 'Poppins_600SemiBold', // Títulos y encabezados
  body: 'Inter_400Regular',       // Descripciones, reseñas, formularios
};

// ===== Tamaños =====
export const SIZES = {
  h1: 24,   // de la guía
  h2: 20,   // derivado
  h3: 16,   // derivado
  body: 14, // de la guía
  small: 12,
};

// ===== Estilos de texto listos para usar =====
export const TYPOGRAPHY = {
  h1: { fontFamily: FONTS.heading, fontSize: SIZES.h1, color: COLORS.primary },
  h2: { fontFamily: FONTS.heading, fontSize: SIZES.h2, color: COLORS.primary },
  h3: { fontFamily: FONTS.heading, fontSize: SIZES.h3, color: COLORS.primary },
  body: { fontFamily: FONTS.body, fontSize: SIZES.body, color: COLORS.text, lineHeight: 20 },
  small: { fontFamily: FONTS.body, fontSize: SIZES.small, color: COLORS.textMuted },
  button: { fontFamily: FONTS.heading, fontSize: SIZES.body, color: COLORS.white },
};

// ===== Espaciado y bordes =====
export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const RADIUS = { sm: 6, md: 12, lg: 20, pill: 999 };

// ===== Sombras (iOS + Android) =====
export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
};

const theme = { COLORS, FONTS, SIZES, TYPOGRAPHY, SPACING, RADIUS, SHADOWS };
export default theme;