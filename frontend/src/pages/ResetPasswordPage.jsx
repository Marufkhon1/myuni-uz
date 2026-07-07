import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import FormField from "@/components/ui/FormField.jsx";
import AuthLayout from "@/layouts/AuthLayout.jsx";
import { PAGE_META } from "@/config/siteMeta.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import { useToast } from "@/hooks/useToast.js";
import { confirmPasswordReset, getPasswordResetStatus } from "@/services/authService.js";
import { getApiErrorMessage } from "@/utils/apiErrors.js";

function formatCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function ResetPasswordPage() {
  usePageMeta(PAGE_META.resetPassword);

  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [sessionActive, setSessionActive] = useState(true);

  useEffect(() => {
    if (!uid || !token) {
      return undefined;
    }

    let isMounted = true;

    async function refreshStatus() {
      try {
        const status = await getPasswordResetStatus(uid, token);
        if (!isMounted) {
          return;
        }
        setSessionActive(Boolean(status.active));
        setSecondsRemaining(Number(status.seconds_remaining) || 0);
      } catch {
        if (isMounted) {
          setSessionActive(false);
          setSecondsRemaining(0);
        }
      }
    }

    refreshStatus();
    const timer = window.setInterval(refreshStatus, 1000);
    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, [uid, token]);

  const clientError = useMemo(() => {
    if (!password && !passwordConfirm) {
      return "";
    }
    if (password.length < 8) {
      return "Parol kamida 8 ta belgidan iborat bo'lsin.";
    }
    if (passwordConfirm && password !== passwordConfirm) {
      return "Parollar mos kelmadi.";
    }
    return "";
  }, [password, passwordConfirm]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!sessionActive) {
      toast.error("30 daqiqa tugadi. Qayta parol tiklash havolasini so'rang.");
      return;
    }
    if (clientError) {
      toast.warning(clientError);
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmPasswordReset({ uid, token, password, password_confirm: passwordConfirm });
      navigate("/login", { replace: true, state: { reset: true } });
    } catch (requestError) {
      const data = requestError.response?.data;
      if (data?.code === "same_as_old") {
        toast.error("Yangi parol eskisiga o'xshash bo'lmasin.");
      } else if (data?.code === "session_expired") {
        setSessionActive(false);
        toast.error(data.detail || "Sessiya tugadi.");
      } else {
        toast.error(getApiErrorMessage(requestError, "Parol yangilanmadi."));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!uid || !token) {
    return (
      <AuthLayout eyebrow="Xatolik" title="Havola noto'g'ri." subtitle="">
        <p className="font-semibold text-slate-600 dark:text-slate-300">Emaildagi havolani qayta oching.</p>
        <Link to="/forgot-password" className="mt-4 inline-block font-black text-primary">
          Qayta so&apos;rash
        </Link>
      </AuthLayout>
    );
  }

  if (!sessionActive) {
    return (
      <AuthLayout
        eyebrow="Sessiya tugadi"
        title="30 daqiqa o'tdi."
        subtitle="Parolni almashtirish vaqti tugadi."
      >
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Havola endi ishlamaydi. Yangi havola so&apos;rang.
        </p>
        <Link
          to="/forgot-password"
          className="mt-4 block w-full rounded-2xl bg-primary px-6 py-4 text-center font-black text-white"
        >
          Yangi havola so&apos;rash
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Yangi parol"
      title="Yangi parolingizni kiriting."
      subtitle={`Qolgan vaqt: ${formatCountdown(secondsRemaining)} — 30 daqiqa ichida tugating.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl bg-amber-50 px-3 py-2 text-center text-sm font-black text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
          Sessiya: {formatCountdown(secondsRemaining)}
        </div>
        <FormField
          id="new-password"
          name="password"
          label="Yangi parol"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="new-password"
          minLength={8}
          error={clientError && password.length > 0 && password.length < 8 ? clientError : undefined}
        />

        <FormField
          id="confirm-password"
          name="password_confirm"
          label="Parolni tasdiqlang"
          type="password"
          value={passwordConfirm}
          onChange={(event) => setPasswordConfirm(event.target.value)}
          required
          autoComplete="new-password"
          minLength={8}
          error={
            clientError && passwordConfirm && password !== passwordConfirm ? clientError : undefined
          }
        />

        <button
          type="submit"
          disabled={isSubmitting || Boolean(clientError)}
          className="w-full rounded-2xl bg-slate-950 px-6 py-4 font-black text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
        >
          {isSubmitting ? "Saqlanmoqda..." : "Parolni yangilash"}
        </button>
      </form>
    </AuthLayout>
  );
}
