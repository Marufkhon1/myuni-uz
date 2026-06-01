import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthCheckSkeleton } from "../components/skeletons/DashboardSkeletons.jsx";
import StatusPageLayout, {
  StatusPrimaryButton,
  StatusSecondaryButton,
} from "../components/ui/StatusPageLayout.jsx";
import { PAGE_META } from "../config/siteMeta.js";
import { useAuth } from "../hooks/useAuth.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { useToast } from "../hooks/useToast.js";
import {
  clearGoogleOAuthHash,
  readGoogleOAuthHashTokens,
} from "../utils/authPaths.js";
import { dashboardPathForRole } from "../utils/navigation.js";

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
  const toast = useToast();
  const { completeGoogleAuth } = useAuth();
  const [error, setError] = useState("");
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) {
      return undefined;
    }
    handledRef.current = true;

    async function finishGoogleAuth() {
      const { access, refresh, next: nextFromHash } = readGoogleOAuthHashTokens();
      const storedNext = sessionStorage.getItem("myuni_auth_next");
      sessionStorage.removeItem("myuni_auth_next");
      clearGoogleOAuthHash();

      if (!access || !refresh) {
        const message = "Google orqali kirish tokenlari topilmadi.";
        setError(message);
        toast.error(message);
        return;
      }

      try {
        const user = await completeGoogleAuth({ access, refresh });
        const destination = resolvePostAuthPath(user, nextFromHash, storedNext);
        navigate(destination, { replace: true });
      } catch {
        const message = "Google orqali kirishda xatolik yuz berdi.";
        setError(message);
        toast.error(message);
      }
    }

    finishGoogleAuth();
  }, [completeGoogleAuth, navigate, toast]);

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
