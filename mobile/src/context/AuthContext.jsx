import { createContext, useContext, useEffect, useState } from "react";
import {
  getMe,
  getToken,
  clearToken,
  getCachedUser,
  setCachedUser,
} from "../services/api";

// 401/403 mean the token is genuinely no longer valid (expired, or the
// account is gone) — that's the only case where dropping the session is
// right. Anything else (offline, server restarting) used to land here too
// and silently logged people out for opening the app without signal.
function isAuthFailure(err) {
  return err?.status === 401 || err?.status === 403;
}

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
      setCachedUser(freshUser);
    } catch (err) {
      if (isAuthFailure(err)) {
        await clearToken();
        setUser(null);
      } else {
        // Offline or server hiccup: keep the session alive on the last known
        // user instead of bouncing a logged-in person to the login screen.
        setUser(await getCachedUser());
      }
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
