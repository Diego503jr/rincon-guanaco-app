import { useMemo } from "react";
import { useTheme } from "../context/ThemeContext";

// factory debe ser una función definida a nivel de módulo (estable)
export function useThemedStyles(factory) {
  const theme = useTheme();
  return useMemo(() => factory(theme), [theme, factory]);
}