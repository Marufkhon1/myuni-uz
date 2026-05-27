import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { getGoogleAuthUrl } from "../services/authService.js";
import { useAuth } from "../hooks/useAuth.js";
import { getApiErrorMessage } from "../utils/apiErrors.js";
import { dashboardPathForRole } from "../utils/navigation.js";

function resolveAfterAuthPath(user, nextParam) {
  if (nextParam && nextParam.startsWith("/")) {
    return nextParam;
  }
  return dashboardPathForRole(user?.profile?.role);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const passwordResetSuccess = location.state?.reset === true;
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const nextPath = searchParams.get("next");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(searchParams.get("google_error") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(resolveAfterAuthPath(user, nextPath), { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, nextPath, user]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(form);
      navigate(resolveAfterAuthPath(loggedInUser, nextPath), { replace: true });
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Kirishda xatolik yuz berdi. Ma'lumotlarni tekshirib qayta urinib ko'ring."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");

    try {
      if (nextPath) {
        sessionStorage.setItem("myuni_auth_next", nextPath);
      }
      const authorizationUrl = await getGoogleAuthUrl({ flow: "login" });
      window.location.href = authorizationUrl;
    } catch (requestError) {
      setError(
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
        <h1 className="text-3xl font-black tracking-tight">Kirish</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Email va parolingiz orqali davom eting.
        </p>
      </div>

      {passwordResetSuccess && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Parolingiz yangilandi. Endi yangi parol bilan kiring.
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

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
            placeholder="Kamida 8 ta belgi"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-premium-gradient px-5 py-4 font-black text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Tekshirilmoqda..." : "Kirish"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">yoki</span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 font-black text-slate-800 shadow-soft transition hover:-translate-y-0.5 hover:border-primary dark:border-white/10 dark:bg-white/10 dark:text-white"
      >
        <span className="inline-flex items-center justify-center gap-3">
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path fill="#4285F4" d="M21.6 12.23c0-.74-.07-1.45-.19-2.14H12v4.05h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.89-1.74 2.98-4.31 2.98-7.43Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H3.07v2.58A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.41 13.9a6 6 0 0 1 0-3.8V7.52H3.07a10 10 0 0 0 0 8.96l3.34-2.58Z" />
            <path fill="#EA4335" d="M12 5.98c1.47 0 2.8.5 3.84 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.93 5.52l3.34 2.58C7.2 7.74 9.4 5.98 12 5.98Z" />
          </svg>
          Google
        </span>
      </button>

      <p className="mt-7 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
        Hali hisobingiz yo'qmi?{" "}
        <Link
          to={nextPath ? `/signup?next=${encodeURIComponent(nextPath)}` : "/signup"}
          className="font-black text-primary"
        >
          Ro'yxatdan o'ting
        </Link>
      </p>
    </AuthLayout>
  );
}
