"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getMe } from "@/services/auth";
import type { AuthUser } from "@/services/auth";
import {
  getToken,
  getUser,
  logout as clearSession,
  saveUser,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: () => {},
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      if (!getToken()) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const cached = getUser();

      if (mounted) {
        setUser(cached);
      }

      try {
        const me = await getMe();

        if (mounted) {
          setUser(me);
          saveUser(me);
        }
      } catch {
        if (mounted) {
          setUser(cached);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signOut: clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
