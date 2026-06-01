import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import RateLimitNotice from "../components/RateLimitNotice.jsx";
import { PAGE_META } from "../config/siteMeta.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { useToast } from "../hooks/useToast.js";
import { getGoogleAuthUrl } from "../services/authService.js";
import { resendEmailVerification } from "../services/trustService.js";
import { useAuth } from "../hooks/useAuth.js";
import {
  getApiErrorMessage,
  getEmailNotVerifiedInfo,
  getRateLimitInfo,
} from "../utils/apiErrors.js";
import { dashboardPathForRole } from "../utils/navigation.js";

function resolveAfterAuthPath(user, nextParam) {
  if (nextParam && nextParam.startsWith("/")) {
    return nextParam;
  }
  return dashboardPathForRole(user?.profile?.role);
}

export default function LoginPage() {
  usePageMeta(PAGE_META.login);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const passwordResetSuccess = location.state?.reset === true;
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const nextPath = searchParams.get("next");
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState(null);
  const [rateLimitActive, setRateLimitActive] = useState(false);

  useEffect(() => {
    const googleError = searchParams.get("google_error");
    if (googleError) {
      toast.error(googleError);
    }
  }, [searchParams, toast]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(resolveAfterAuthPath(user, nextPath), { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, nextPath, user]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setEmailNotVerified(null);
    setRateLimit(null);
    setRateLimitActive(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setEmailNotVerified(null);
    setRateLimit(null);
    setRateLimitActive(false);

    try {
      const loggedInUser = await login(form);
      navigate(resolveAfterAuthPath(loggedInUser, nextPath), { replace: true });
    } catch (requestError) {
      const verifyInfo = getEmailNotVerifiedInfo(requestError);
      if (verifyInfo) {
        setEmailNotVerified(verifyInfo);
        return;
      }
      toast.error(
        getApiErrorMessage(
          requestError,
          "Kirishda xatolik yuz berdi. Ma'lumotlarni tekshirib qayta urinib ko'ring."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendVerification() {
    const email = emailNotVerified?.email || form.email;
    if (!email || resendLoading) {
      return;
    }
    setResendLoading(true);
    setRateLimit(null);
    setRateLimitActive(false);
    try {
      await resendEmailVerification(email);
      toast.success("Tasdiqlash xati yuborildi. Pochtangizni tekshiring.");
    } catch (requestError) {
      const limit = getRateLimitInfo(requestError);
      if (limit) {
        setRateLimit(limit);
        setRateLimitActive(true);
      }
      toast.error(getApiErrorMessage(requestError, "Xat yuborilmadi."));
    } finally {
      setResendLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      if (nextPath) {
        sessionStorage.setItem("myuni_auth_next", nextPath);
      }
      const authorizationUrl = await getGoogleAuthUrl({ flow: "login" });
      window.location.href = authorizationUrl;
    } catch (requestError) {
      toast.error(
        getApiErrorMessage(
          requestError,
          "Google orqali kirish hozircha yoqilmagan. Email va parol bilan kiring yoki backend/.env da OAuth sozlang."
        )
      );
    }
  }

  return (
    <AuthLayout
      eyebrow="Xush kelibsiz"
      title="MyUni.uz hisobingizga kiring."
      subtitle="Universitetlar, sharhlar va hamjamiyat imkoniyatlaridan foydalanishda davom eting."
    >
      <div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Kirish</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Email va parolingiz orqali davom eting.
        </p>
      </div>

      {passwordResetSuccess && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Parolingiz yangilandi. Endi yangi parol bilan kiring.
        </div>
      )}

      {emailNotVerified ? (
        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900 dark:border-amber-400/30 dark:bg-amber-950/40 dark:text-amber-100">
            {emailNotVerified.detail}
          </div>
          {rateLimit ? (
            <RateLimitNotice
              message={rateLimit.detail}
              retryAfterSeconds={rateLimit.retryAfterSeconds}
              onExpired={() => {
                setRateLimitActive(false);
                setRateLimit(null);
              }}
            />
          ) : null}
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendLoading || rateLimitActive}
            className="w-full rounded-2xl border border-primary bg-blue-50 px-5 py-3 text-sm font-black text-primary disabled:opacity-50 dark:bg-primary/10"
          >
            {resendLoading ? "Yuborilmoqda..." : "Tasdiqlash xatini qayta yuborish"}
          </button>
          {emailNotVerified.email ? (
            <Link
              to={`/verify-email/pending?email=${encodeURIComponent(emailNotVerified.email)}`}
              className="block text-center text-sm font-black text-primary"
            >
              Tasdiqlash ko&apos;rsatmalarini ko&apos;rish
            </Link>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <label className="block">
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={updateField}
            required
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-white/10 dark:focus:ring-blue-400/10"
            placeholder="you@example.com"
          />
        </label>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-black text-primary">
            Parolni unutdingizmi?
          </Link>
        </div>

        <label className="block">
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">Parol</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={updateField}
            required
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-white/10 dark:focus:ring-blue-400/10"
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-slate-950 px-6 py-4 font-black text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-white dark:text-slate-950"
        >
          {isSubmitting ? "Kirish..." : "Kirish"}
        </button>
      </form>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 font-black text-slate-800 transition hover:border-primary dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          Google orqali kirish
        </button>
      </div>

      <p className="mt-8 text-center text-sm font-semibold text-slate-500">
        Hisobingiz yo&apos;qmi?{" "}
        <Link to={nextPath ? `/signup?next=${encodeURIComponent(nextPath)}` : "/signup"} className="font-black text-primary">
          Ro&apos;yxatdan o&apos;tish
        </Link>
      </p>
    </AuthLayout>
  );
}
