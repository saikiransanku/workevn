import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { fetchCurrentUser, loginAdmin, AUTH_STORAGE_KEY, AuthUser, logoutAdmin } from "../api/authApi";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(AUTH_STORAGE_KEY) || window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    fetchCurrentUser(storedToken)
      .then((data) => {
        if (data.user.role !== "admin") {
          throw new Error("Unauthorized admin user");
        }

        setUser(data.user);
        setToken(storedToken);
      })
      .catch(() => {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string, remember = true) => {
    setIsLoading(true);
    const payload = await loginAdmin(email, password);
    if (payload.user.role !== "admin") {
      throw new Error("Only admin users can sign in to this dashboard.");
    }

    // store token in localStorage when 'remember' else use sessionStorage
    if (remember) window.localStorage.setItem(AUTH_STORAGE_KEY, payload.token);
    else window.sessionStorage.setItem(AUTH_STORAGE_KEY, payload.token);

    setToken(payload.token);
    setUser(payload.user);
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      if (token) await logoutAdmin(token);
    } catch (e) {
      // ignore
    }
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setToken(null);
    window.location.replace("/login");
  };

  const value = useMemo(
    () => ({ user, token, isLoading, login, logout }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
