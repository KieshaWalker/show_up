import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { clearAuthToken, setAuthToken } from "./api";

const TOKEN_KEY = "stack_auth_token";

export async function getStoredToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await getStoredToken();
      if (!mounted) return;
      setToken(stored);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const save = async (value: string) => {
    await setAuthToken(value);
    setToken(value);
  };

  const clear = async () => {
    await clearAuthToken();
    setToken(null);
  };

  return { token, loading, save, clear };
}
