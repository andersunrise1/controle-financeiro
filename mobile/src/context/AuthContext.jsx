import { createContext, useContext, useEffect, useState } from "react";
import { getMe, getToken, clearToken } from "../services/api";

const AuthContext = createContext({
  user: null,
  isReady: false,
  setUser: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const refreshUser = async () => {
    const token = await getToken();
    if (!token) {
      setUser(null);
      setIsReady(true);
      return;
    }

    try {
      const { user: freshUser } = await getMe();
      setUser(freshUser);
    } catch {
      await clearToken();
      setUser(null);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isReady, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
