import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearTokens,
  establishAuthSession,
  exchangeAuthCode,
  getCurrentUser,
  login as loginRequest,
  logoutSession,
  markCookieSession,
  register as registerRequest,
} from "@/services/authService.js";
import { ensureCsrfCookie } from "@/services/api.js";
import { AuthContext } from "./authContext.js";
import {
  isGoogleOAuthCallbackPath,
  readGoogleOAuthCallbackParams,
  readGoogleOAuthHashTokens,
} from "@/utils/authPaths.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      await ensureCsrfCookie();

      if (isGoogleOAuthCallbackPath()) {
        const { ok, code } = readGoogleOAuthCallbackParams();
        const { access, refresh } = readGoogleOAuthHashTokens();
        if (ok || code || (access && refresh)) {
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }
      }

      try {
        const currentUser = await getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        if (isMounted && !isGoogleOAuthCallbackPath()) {
          clearTokens();
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutSession();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      role: user?.profile?.role,
      async login(payload) {
        const nextUser = await loginRequest(payload);
        setUser(nextUser);
        return nextUser;
      },
      async register(payload) {
        const data = await registerRequest(payload);
        if (data.user) {
          setUser(data.user);
        }
        return data;
      },
      async completeCookieAuth() {
        markCookieSession();
        const nextUser = await getCurrentUser();
        setUser(nextUser);
        return nextUser;
      },
      async completeOAuthExchange(code) {
        const session = await exchangeAuthCode(code);
        const nextUser = session.user || (await getCurrentUser());
        setUser(nextUser);
        return nextUser;
      },
      async completeGoogleAuth(tokens) {
        if (!tokens?.access || !tokens?.refresh) {
          markCookieSession();
          const nextUser = await getCurrentUser();
          setUser(nextUser);
          return nextUser;
        }
        const session = await establishAuthSession(tokens);
        const nextUser = session.user || (await getCurrentUser());
        setUser(nextUser);
        return nextUser;
      },
      logout,
      async refreshUser() {
        const nextUser = await getCurrentUser();
        setUser(nextUser);
        return nextUser;
      },
      setUser,
    }),
    [isLoading, logout, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
