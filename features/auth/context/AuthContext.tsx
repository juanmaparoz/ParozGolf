"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "golf-saas-authenticated";
const CURRENT_PLAYER_KEY = "golf-saas-current-player-id";

interface AuthContextValue {
  isAuthenticated: boolean;
  isInitialized: boolean;
  /** Id del jugador con el que iniciaste sesión (para mostrar "Tú" en En vivo) */
  currentPlayerId: string | null;
  login: (playerId: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredAuth(): { authenticated: boolean; playerId: string | null } {
  if (typeof window === "undefined") return { authenticated: false, playerId: null };
  try {
    const auth = window.localStorage.getItem(STORAGE_KEY) === "true";
    const playerId = window.localStorage.getItem(CURRENT_PLAYER_KEY);
    return { authenticated: auth, playerId: playerId || null };
  } catch {
    return { authenticated: false, playerId: null };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const { authenticated, playerId } = readStoredAuth();
    setIsAuthenticated(authenticated);
    setCurrentPlayerId(playerId);
    setIsInitialized(true);
  }, []);

  const login = useCallback((playerId: string | null) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
      if (playerId) {
        window.localStorage.setItem(CURRENT_PLAYER_KEY, playerId);
      } else {
        window.localStorage.removeItem(CURRENT_PLAYER_KEY);
      }
    }
    setIsAuthenticated(true);
    setCurrentPlayerId(playerId ?? null);
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(CURRENT_PLAYER_KEY);
    }
    setIsAuthenticated(false);
    setCurrentPlayerId(null);
    router.push("/login");
  }, [router]);

  const value: AuthContextValue = {
    isAuthenticated,
    isInitialized,
    currentPlayerId,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
