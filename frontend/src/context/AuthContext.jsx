import { useEffect, useMemo, useState } from "react";
import {
  clearTokens,
  getCurrentUser,
  hasAccessToken,
  hasRefreshToken,
  login as loginRequest,
  register as registerRequest,
  saveTokens,
} from "../services/authService.js";
import { AuthContext } from "./authContext.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      if (!hasAccessToken() && !hasRefreshToken()) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        if (isMounted) {
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
        const nextUser = await registerRequest(payload);
        setUser(nextUser);
        return nextUser;
      },
      async completeGoogleAuth(tokens) {
        saveTokens(tokens);
        const nextUser = await getCurrentUser();
        setUser(nextUser);
        return nextUser;
      },
      logout() {
        clearTokens();
        setUser(null);
      },
      async refreshUser() {
        const nextUser = await getCurrentUser();
        setUser(nextUser);
        return nextUser;
      },
      setUser,
    }),
    [isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
