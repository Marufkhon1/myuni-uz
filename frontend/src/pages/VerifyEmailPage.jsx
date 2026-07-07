import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout.jsx";
import { PAGE_META } from "@/config/siteMeta.js";
import { useAuth } from "@/hooks/useAuth.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import { useToast } from "@/hooks/useToast.js";
import { confirmEmailVerification } from "@/services/trustService.js";
import { getApiErrorMessage } from "@/utils/apiErrors.js";
import { dashboardPathForRole } from "@/utils/navigation.js";

export default function VerifyEmailPage() {
  usePageMeta(PAGE_META.verifyEmail);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { completeGoogleAuth } = useAuth();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!uid || !token) {
        setStatus("invalid");
        setErrorMessage("Tasdiqlash havolasi noto'g'ri.");
        return;
      }

      try {
        const data = await confirmEmailVerification({ uid, token });
        if (cancelled) {
          return;
        }
        await completeGoogleAuth({ access: data.access, refresh: data.refresh });
        setStatus("success");
        toast.success("Email muvaffaqiyatli tasdiqlandi!");
        navigate(dashboardPathForRole(data.user?.profile?.role), { replace: true });
      } catch (requestError) {
        if (cancelled) {
          return;
        }
        setStatus("error");
        setErrorMessage(
          getApiErrorMessage(requestError, "Tasdiqlash havolasi noto'g'ri yoki muddati tugagan.")
        );
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [completeGoogleAuth, navigate, toast, token, uid]);

  return (
    <AuthLayout
      eyebrow="Email tasdiqlash"
      title="Hisobingiz tasdiqlanmoqda..."
      subtitle="Bir necha soniya kuting."
      showBackHome={false}
    >
      <div className="space-y-5 text-center">
        {status === "loading" && (
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Email manzilingiz tekshirilmoqda...
          </p>
        )}
        {(status === "error" || status === "invalid") && (
          <>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{errorMessage}</p>
            <Link
              to="/login"
              className="inline-block rounded-2xl bg-slate-950 px-6 py-4 font-black text-white dark:bg-white dark:text-slate-950"
            >
              Kirish sahifasiga qaytish
            </Link>
          </>
        )}
        {status === "success" && (
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Muvaffaqiyatli! Kabinetga yo&apos;naltirilmoqdasiz...
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
