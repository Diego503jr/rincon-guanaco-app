import { useState, useCallback, useRef, useEffect } from "react";
import { getErrorMessage } from "../api/errors";

export default function useApi(apiFunc) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Devuelve el resultado, o null si falló (el mensaje queda en "error")
  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunc(...args);
        if (mounted.current) setData(result);
        return result;
      } catch (err) {
        if (mounted.current) setError(getErrorMessage(err));
        return null;
      } finally {
        if (mounted.current) setLoading(false);
      }
    },
    [apiFunc],
  );

  return { data, loading, error, execute, setData };
}
