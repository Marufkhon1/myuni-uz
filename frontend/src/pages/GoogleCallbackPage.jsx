import { useEffect, useState } from "react";
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

export default function GoogleCallbackPage() {
  usePageMeta(PAGE_META.googleCallback);

  const navigate = useNavigate();
  const toast = useToast();
  const { completeGoogleAuth } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    async function finishGoogleAuth() {
      const params = new URLSearchParams(window.location.hash.replace("#", ""));
      const access = params.get("access");
      const refresh = params.get("refresh");
      const storedNext = sessionStorage.getItem("myuni_auth_next");
      const next = params.get("next") || storedNext || "/dashboard";
      sessionStorage.removeItem("myuni_auth_next");

      if (!access || !refresh) {
        const message = "Google orqali kirish tokenlari topilmadi.";
        setError(message);
        toast.error(message);
        return;
      }

      try {
        await completeGoogleAuth({ access, refresh });
        navigate(next, { replace: true });
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
