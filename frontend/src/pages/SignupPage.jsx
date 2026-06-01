import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import UniversitySearchSelect from "../components/dashboard/UniversitySearchSelect.jsx";
import { matchUniversityByText } from "../utils/universityMatch.js";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { PAGE_META } from "../config/siteMeta.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { useToast } from "../hooks/useToast.js";
import { getGoogleAuthUrl } from "../services/authService.js";
import { getPublicUniversities } from "../services/publicService.js";
import { getApiErrorMessage } from "../utils/apiErrors.js";
import { dashboardPathForRole } from "../utils/navigation.js";

const roles = [
  {
    id: "applicant",
    title: "Abituriyent",
    description: "Universitet tanlayapsiz — sharhlarni o'qish va taqqoslash.",
  },
  {
    id: "student",
    title: "Talaba",
    description: "O'qiyotgan joyingizda sharh yozasiz va chatda qatnashasiz.",
  },
];

function resolveAfterAuthPath(user, nextParam) {
  if (nextParam && nextParam.startsWith("/")) {
    return nextParam;
  }
  return dashboardPathForRole(user?.profile?.role);
}

export default function SignupPage() {
  usePageMeta(PAGE_META.signup);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { register, isAuthenticated, isLoading, user } = useAuth();
  const nextPath = searchParams.get("next");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "applicant",
    university: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [isUniversitiesLoading, setIsUniversitiesLoading] = useState(true);

  useEffect(() => {
    const googleError = searchParams.get("google_error");
    if (googleError) {
      toast.error(googleError);
    }
  }, [searchParams, toast]);

  useEffect(() => {
    let isMounted = true;

    async function loadUniversities() {
      try {
        const { results } = await getPublicUniversities();
        if (isMounted) {
          setUniversities(results);
        }
      } catch {
        if (isMounted) {
          toast.error("Universitetlar ro'yxatini yuklab bo'lmadi. Keyinroq qayta urinib ko'ring.");
        }
      } finally {
        if (isMounted) {
          setIsUniversitiesLoading(false);
        }
      }
    }

    loadUniversities();
    return () => {
      isMounted = false;
    };
  }, [toast]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(resolveAfterAuthPath(user, nextPath), { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, nextPath, user]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function setUniversity(value) {
    setForm((current) => ({ ...current, university: value }));
  }

  function ensureUniversitySelected() {
    if (!matchUniversityByText(universities, form.university)) {
      toast.warning("Ro'yxatdan universitetni tanlang.");
      return false;
    }
    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!ensureUniversitySelected()) {
      return;
    }
    setIsSubmitting(true);

    try {
      const result = await register(form);
      if (result.requires_email_verification) {
        if (result.email_sent === false) {
          toast.warning(result.detail);
        }
        navigate(
          `/verify-email/pending?email=${encodeURIComponent(result.email || form.email)}`,
          { replace: true }
        );
        return;
      }
      if (result.user) {
        navigate(resolveAfterAuthPath(result.user, nextPath), { replace: true });
      }
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Ro'yxatdan o'tishda xatolik yuz berdi."));
    } finally {
      setIsSubmitting(false);
    }
  }

  const isStudentRole = form.role === "student";
  const universityFieldLabel = isStudentRole
    ? "Siz tahsil olayotgan universitet"
    : "Siz tanlamoqchi bo'lgan universitet";
  const universityPlaceholder = isStudentRole
    ? "Tahsil olayotgan universitetingizni tanlang"
    : "Tanlamoqchi universitetingizni tanlang";

  async function handleGoogleLogin() {
    if (!ensureUniversitySelected()) {
      return;
    }

    try {
      if (nextPath) {
        sessionStorage.setItem("myuni_auth_next", nextPath);
      }
      const authorizationUrl = await getGoogleAuthUrl({
        flow: "signup",
        role: form.role,
        university: form.university,
      });
      window.location.href = authorizationUrl;
    } catch (requestError) {
      toast.error(
        getApiErrorMessage(
          requestError,
          "Google orqali ro'yxatdan o'tish hozircha yoqilmagan. Email bilan ro'yxatdan o'ting."
        )
      );
    }
  }

  return (
    <AuthLayout
      eyebrow="Yangi hisob"
      title="MyUni.uz hisobingizni yarating."
      subtitle="Universitetingizni tanlang va platformadan o'zingizga mos rol bilan foydalaning."
    >
      <div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Ro'yxatdan o'tish</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          MyUni.uz hisobingizni yarating.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setForm((current) => ({ ...current, role: role.id }))}
              className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 ${
                form.role === role.id
                  ? "border-primary bg-blue-50 shadow-glow dark:bg-blue-400/10"
                  : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"
              }`}
            >
              <span className="text-lg font-black">{role.title}</span>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {role.description}
              </p>
            </button>
          ))}
        </div>

        <label className="block">
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">Ism-familiya</span>
          <input
            name="full_name"
            value={form.full_name}
            onChange={updateField}
            required
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-white/10"
            placeholder="Masalan: Ali Valiyev"
          />
        </label>

        <label className="block">
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={updateField}
            required
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-white/10"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">Parol</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={updateField}
            required
            minLength={8}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-white/10"
            placeholder="Kamida 8 ta belgi"
          />
        </label>

        <div className="block">
          <label className="text-sm font-black text-slate-700 dark:text-slate-200">
            {universityFieldLabel}
          </label>
          <div className="mt-2">
            <UniversitySearchSelect
              universities={universities}
              value={form.university}
              onChange={setUniversity}
              disabled={isUniversitiesLoading || universities.length === 0}
              placeholder={isUniversitiesLoading ? "Yuklanmoqda..." : universityPlaceholder}
              reserveHintSpace
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-premium-gradient px-5 py-4 font-black text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Yaratilmoqda..." : "Hisob yaratish"}
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
        Hisobingiz bormi?{" "}
        <Link to="/login" className="font-black text-primary">
          Kirish
        </Link>
      </p>
    </AuthLayout>
  );
}
