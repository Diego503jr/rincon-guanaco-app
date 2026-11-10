import { COLORS, TYPOGRAPHY } from "./theme";

// Claro: tus colores actuales + roles nuevos (se ve igual que hoy)
export const LIGHT_COLORS = {
  ...COLORS,
  background: COLORS.background ?? "#F8F9FA",
  surface: COLORS.white,       // tarjetas, inputs, modales
  surfaceAlt: "#EEF1F4",       // chips, filas alternas
  border: "#D5DBE1",
  primaryText: COLORS.primary, // primary cuando se usa como texto/ícono/enlace
  onAccent: "#FFFFFF",         // texto sobre botones naranja
  error: "#D62839",
  overlay: "rgba(0,0,0,0.45)",
};

// Oscuro: lo que no se redefine aquí conserva el valor de COLORS
export const DARK_COLORS = {
  ...COLORS,
  background: "#0E1621",
  surface: "#162231",
  surfaceAlt: "#1E2D40",
  text: "#E8ECF1",
  textMuted: "#9AA7B5",
  border: "#2A3B52",
  primary: "#0B2545",          // headers y fondos (igual que en claro)
  primaryText: "#8DB4F0",      // el azul añil no se lee sobre fondo oscuro
  accent: "#F26419",
  onAccent: "#FFFFFF",
  error: "#FF6B6B",
  overlay: "rgba(0,0,0,0.65)",
  white: "#FFFFFF",
};

// TYPOGRAPHY trae colores fijos (texto oscuro): los reemplaza según el tema
export function buildTypography(colors) {
  const colorMap = {
    [COLORS.text]: colors.text,
    [COLORS.textMuted]: colors.textMuted,
    [COLORS.primary]: colors.primaryText,
  };

  return Object.fromEntries(
    Object.entries(TYPOGRAPHY).map(([key, style]) => [
      key,
      { ...style, color: colorMap[style.color] ?? style.color },
    ])
  );
}