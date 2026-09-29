"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  AccessStatus,
  ApiError,
  getMe,
  getToken,
  clearToken,
  setPaymentRequiredHandler,
} from "@/lib/api";

// Only a genuinely invalid token (401/403) should end the session. Any other
// failure — offline, server restarting — used to land in the same catch and
// silently sign the user out.
function isAuthFailure(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 401 || err.status === 403);
}

interface AuthContextType {
  user: User | null;
  /** Estado do teste/plano. null enquanto não se sabe (sem sessão ou carregando). */
  access: AccessStatus | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setAccess: (access: AccessStatus | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  access: null,
  loading: true,
  setUser: () => {},
  setAccess: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setAccess(null);
      setLoading(false);
      return;
    }

    try {
      const { user, access } = await getMe();
      setUser(user);
      setAccess(access ?? null);
    } catch (err) {
      if (isAuthFailure(err)) {
        clearToken();
      }
      setUser(null);
      setAccess(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Qualquer 402 (escrita recusada por teste vencido) revalida o estado, para
  // que o aviso apareça na hora em vez de só no próximo carregamento.
  useEffect(() => {
    setPaymentRequiredHandler(() => {
      refreshUser();
    });
    return () => setPaymentRequiredHandler(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, access, loading, setUser, setAccess, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
