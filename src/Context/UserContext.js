import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "../api/services/authService";
import { storage } from "../api/storage";
import { setUnauthorizedHandler } from "../api/client";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true mientras se restaura la sesión

  const clearSession = useCallback(async () => {
    await storage.clear();
    setUser(null);
    setToken(null);
  }, []);

  const saveSession = useCallback(
    async ({ token: newToken, user: newUser }) => {
      await storage.setToken(newToken);
      await storage.setUser(newUser);
      setToken(newToken);
      setUser(newUser);
    },
    [],
  );

  // Al abrir la app: restaura la sesión guardada y la valida con /me
  useEffect(() => {
    setUnauthorizedHandler(clearSession);

    (async () => {
      try {
        const savedToken = await storage.getToken();
        if (!savedToken) return;

        setToken(savedToken);
        const savedUser = await storage.getUser();
        if (savedUser) setUser(savedUser); // muestra al usuario sin esperar la red

        try {
          const freshUser = await authService.me();
          await storage.setUser(freshUser);
          setUser(freshUser);
        } catch {
          // 401: el interceptor ya cerró la sesión.
          // Sin internet: se conserva el usuario guardado.
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [clearSession]);

  const login = useCallback(
    async (email, password) => {
      const data = await authService.login({ email, password });
      await saveSession(data);
      return data.user;
    },
    [saveSession],
  );

  const register = useCallback(
    async (payload) => {
      const data = await authService.register(payload);
      await saveSession(data);
      return data.user;
    },
    [saveSession],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout(); // revoca el token en Laravel
    } catch {
      // aunque falle la red, se cierra la sesión local
    }
    await clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!token,
      login,
      register,
      logout,
      setUser,
    }),
    [user, token, loading, login, register, logout],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser debe usarse dentro de <UserProvider>");
  return context;
};
