import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthCheckSkeleton } from "@/components/skeletons/DashboardSkeletons.jsx";
import StatusPageLayout, {
  StatusPrimaryButton,
  StatusSecondaryButton,
} from "@/components/ui/StatusPageLayout.jsx";
import { PAGE_META } from "@/config/siteMeta.js";
import { useAuth } from "@/hooks/useAuth.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import { useToast } from "@/hooks/useToast.js";
import {
  clearGoogleOAuthHash,
  GOOGLE_OAUTH_NOTICE_MESSAGES,
  readGoogleOAuthCallbackParams,
  readGoogleOAuthHashTokens,
} from "@/utils/authPaths.js";
import { dashboardPathForRole } from "@/utils/navigation.js";

function resolvePostAuthPath(user, nextParam, storedNext) {
  if (storedNext && storedNext.startsWith("/")) {
    return storedNext;
  }
  if (nextParam && nextParam.startsWith("/")) {
    return nextParam;
  }
  return dashboardPathForRole(user?.profile?.role);
}

export default function GoogleCallbackPage() {
  usePageMeta(PAGE_META.googleCallback);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { completeOAuthExchange, completeGoogleAuth } = useAuth();
  const [error, setError] = useState("");
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) {
      return undefined;
    }
    handledRef.current = true;

    async function finishGoogleAuth() {
      const storedNext = sessionStorage.getItem("myuni_auth_next");
      sessionStorage.removeItem("myuni_auth_next");

      const { ok, next: nextFromQuery, code, googleError, googleNotice } = readGoogleOAuthCallbackParams(
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      );

      if (googleError) {
        setError(googleError);
        toast.error(googleError);
        return;
      }

      try {
        let user;
        if (ok && code) {
          clearGoogleOAuthHash();
          // Strip code from URL ASAP (history / screenshot safety).
          window.history.replaceState(null, "", "/oauth/google/callback");
          user = await completeOAuthExchange(code);
          const noticeMessage = GOOGLE_OAUTH_NOTICE_MESSAGES[googleNotice];
          if (noticeMessage) {
            toast.info(noticeMessage);
          }
          const destination = resolvePostAuthPath(user, nextFromQuery, storedNext);
          navigate(destination, { replace: true });
          return;
        }

        // Legacy hash fallback.
        const { access, refresh, next: nextFromHash } = readGoogleOAuthHashTokens();
        clearGoogleOAuthHash();
        if (!access || !refresh) {
          const message = "Google orqali kirish yakunlanmadi. Qayta urinib ko'ring.";
          setError(message);
          toast.error(message);
          return;
        }
        user = await completeGoogleAuth({ access, refresh });
        const destination = resolvePostAuthPath(user, nextFromHash, storedNext);
        navigate(destination, { replace: true });
      } catch {
        const message = "Google orqali kirishda xatolik yuz berdi.";
        setError(message);
        toast.error(message);
      }
    }

    finishGoogleAuth();
  }, [completeGoogleAuth, completeOAuthExchange, navigate, searchParams, toast]);

  if (error) {
    return (
      <StatusPageLayout
        variant="error"
        eyebrow="Google kirish"
        title="Kirish yakunlanmadi"
        description={error}
        primaryAction={<StatusPrimaryButton to="/login">Login sahifasiga qaytish</StatusPrimaryButton>}
        secondaryAction={<StatusSecondaryButton to="/">Bosh sahifaga</StatusSecondaryButton>}
      />
    );
  }

  return <AuthCheckSkeleton />;
}
