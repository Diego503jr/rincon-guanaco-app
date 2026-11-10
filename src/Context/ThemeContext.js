import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "./UserContext";
import { LIGHT_COLORS, DARK_COLORS, buildTypography } from "../constants/themes";

const STORAGE_KEY = "theme_mode"; // 'system' | 'light' | 'dark'
const MODES = ["system", "light", "dark"];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const { isAuthenticated } = useUser();

  const [mode, setModeState] = useState("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (MODES.includes(saved)) setModeState(saved);
      })
      .finally(() => setReady(true));
  }, []);

  const setMode = useCallback((next) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  // El oscuro solo se aplica con sesión iniciada
  const prefersDark = mode === "system" ? systemScheme === "dark" : mode === "dark";
  const isDark = isAuthenticated && prefersDark;

  const value = useMemo(() => {
    const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
    return {
      mode,
      setMode,
      isDark,
      colors,
      typography: buildTypography(colors),
      ready,
    };
  }, [mode, setMode, isDark, ready]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return ctx;
};