"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AdminUser } from "@/lib/auth/types";
import { parseJsonResponse } from "@/lib/http/parse-json-response";

type SessionContextValue = {
  user: AdminUser | null;
  sessionToken: string | null;
  isLoading: boolean;
  setSession: (session: { user: AdminUser; sessionToken: string }) => void;
  clearSession: () => void;
  refreshSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
  initialUser,
  initialToken,
}: {
  children: ReactNode;
  initialUser?: AdminUser | null;
  initialToken?: string | null;
}) {
  const [user, setUser] = useState<AdminUser | null>(initialUser ?? null);
  const [sessionToken, setSessionToken] = useState<string | null>(
    initialToken ?? null
  );
  const [isLoading, setIsLoading] = useState(!initialUser);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/token", { credentials: "include" });
      const data = await parseJsonResponse<{
        token: string | null;
        user: AdminUser | null;
      }>(res);
      setSessionToken(data?.token ?? null);
      setUser(data?.user ?? null);
    } catch {
      setSessionToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialUser) void refreshSession();
  }, [initialUser, refreshSession]);

  const setSession = useCallback(
    (session: { user: AdminUser; sessionToken: string }) => {
      setUser(session.user);
      setSessionToken(session.sessionToken);
      setIsLoading(false);
    },
    []
  );

  const clearSession = useCallback(() => {
    setUser(null);
    setSessionToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      sessionToken,
      isLoading,
      setSession,
      clearSession,
      refreshSession,
    }),
    [user, sessionToken, isLoading, setSession, clearSession, refreshSession]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useAdminSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useAdminSession must be used within SessionProvider");
  }
  return ctx;
}
