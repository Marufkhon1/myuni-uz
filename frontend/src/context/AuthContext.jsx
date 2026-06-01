import { useEffect, useMemo, useState } from "react";
import {
  clearTokens,
  establishAuthSession,
  getCurrentUser,
  login as loginRequest,
  logoutSession,
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
        const data = await registerRequest(payload);
        if (data.user) {
          setUser(data.user);
        }
        return data;
      },
      async completeGoogleAuth(tokens) {
        await establishAuthSession(tokens);
        const nextUser = await getCurrentUser();
        setUser(nextUser);
        return nextUser;
      },
      async logout() {
        await logoutSession();
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
