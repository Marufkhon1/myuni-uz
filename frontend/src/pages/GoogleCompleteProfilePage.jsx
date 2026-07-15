import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import UniversitySearchSelect from "@/components/dashboard/UniversitySearchSelect.jsx";
import FormField from "@/components/ui/FormField.jsx";
import { PAGE_META } from "@/config/siteMeta.js";
import { useAuth } from "@/hooks/useAuth.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import { useToast } from "@/hooks/useToast.js";
import AuthLayout from "@/layouts/AuthLayout.jsx";
import { completeGoogleProfile } from "@/services/authService.js";
import { getPublicUniversities } from "@/services/publicService.js";
import { getApiErrorMessage } from "@/utils/apiErrors.js";
import { matchUniversityByText } from "@/utils/universityMatch.js";
import { dashboardPathForRole } from "@/utils/navigation.js";
import { usernameValidationMessage } from "@/utils/username.js";
import { AuthCheckSkeleton } from "@/components/skeletons/DashboardSkeletons.jsx";

const ROLES = [
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

function resolveAfterSetupPath(user, nextParam) {
  if (nextParam && nextParam.startsWith("/")) {
    return nextParam;
  }
  return dashboardPathForRole(user?.profile?.role);
}

function suggestUsernameFromEmail(email) {
  const local = String(email || "")
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/^[._-]+|[._-]+$/g, "");
  if (local.length >= 3) {
    return local.slice(0, 30);
  }
  return "";
}

export default function GoogleCompleteProfilePage() {
  usePageMeta({
    ...PAGE_META.googleCallback,
    title: "Profilni to'ldirish | MyUni.uz",
    path: "/oauth/google/complete",
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { user, isAuthenticated, isLoading, refreshUser, logout } = useAuth();
  const nextPath = searchParams.get("next");

  const [form, setForm] = useState({
    role: "applicant",
    university: "",
    username: "",
  });
  const [universities, setUniversities] = useState([]);
  const [isUniversitiesLoading, setIsUniversitiesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    getPublicUniversities()
      .then(({ results }) => {
        if (mounted) {
          setUniversities(results);
        }
      })
      .catch(() => {
        if (mounted) {
          toast.error("Universitetlar ro'yxatini yuklab bo'lmadi.");
        }
      })
      .finally(() => {
        if (mounted) {
          setIsUniversitiesLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [toast]);

  useEffect(() => {
    if (isLoading || initialized || !user) {
      return;
    }
    setForm((current) => ({
      role: user.profile?.role === "student" ? "student" : "applicant",
      university: user.profile?.university || current.university || "",
      username:
        user.needs_profile_setup && String(user.username || "").includes("@")
          ? suggestUsernameFromEmail(user.email || user.username)
          : user.username || "",
    }));
    setInitialized(true);
  }, [initialized, isLoading, user]);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      navigate("/signup", { replace: true });
      return;
    }
    if (user && !user.needs_profile_setup) {
      navigate(resolveAfterSetupPath(user, nextPath), { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, nextPath, user]);

  const isStudentRole = form.role === "student";
  const universityFieldLabel = isStudentRole
    ? "Siz tahsil olayotgan universitet"
    : "Siz tanlamoqchi bo'lgan universitet";
  const universityPlaceholder = isStudentRole
    ? "Tahsil olayotgan universitetingizni tanlang"
    : "Tanlamoqchi universitetingizni tanlang";

  const displayName = useMemo(
    () => user?.profile?.full_name || user?.first_name || user?.email || "Foydalanuvchi",
    [user]
  );

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const usernameError = usernameValidationMessage(form.username);
    if (usernameError) {
      toast.warning(usernameError);
      return;
    }

    const matchedUniversity = matchUniversityByText(universities, form.university);
    if (!matchedUniversity) {
      toast.warning("Ro'yxatdan universitetni tanlang.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await completeGoogleProfile({
        role: form.role,
        username: form.username.trim(),
        university: matchedUniversity.name,
        university_id: matchedUniversity.id,
      });
      await refreshUser();
      toast.success("Profil tayyor! Xush kelibsiz.");
      navigate(resolveAfterSetupPath(updated, nextPath), { replace: true });
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Profilni saqlab bo'lmadi."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !user || !user.needs_profile_setup) {
    return <AuthCheckSkeleton />;
  }

  return (
    <AuthLayout
      eyebrow="Google hisob"
      title="Profilni yakunlang."
      subtitle="Rol, universitet va login nickname — keyin kabinetga o'tasiz."
    >
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Oxirgi qadam</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Hisobingiz ochildi</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Salom, <span className="font-black text-slate-900 dark:text-white">{displayName}</span>.
          Davom etish uchun quyidagi ma&apos;lumotlarni to&apos;ldiring.
        </p>
        {user.email ? (
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Google email: {user.email}
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
        <div>
          <p className="text-sm font-black text-slate-700 dark:text-slate-200">Siz kimsiz?</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {ROLES.map((role) => (
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
        </div>

        <div className="block">
          <label className="text-sm font-black text-slate-700 dark:text-slate-200">
            {universityFieldLabel}
          </label>
          <div className="mt-2">
            <UniversitySearchSelect
              universities={universities}
              value={form.university}
              onChange={(value) => setForm((current) => ({ ...current, university: value }))}
              disabled={isUniversitiesLoading || universities.length === 0}
              placeholder={isUniversitiesLoading ? "Yuklanmoqda..." : universityPlaceholder}
              reserveHintSpace
            />
          </div>
        </div>

        <FormField
          id="google-complete-username"
          name="username"
          label="Login (nickname)"
          value={form.username}
          onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
          required
          autoComplete="username"
          placeholder="masalan: ali_valiyev"
        />
        <p className="-mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Login bilan keyin kirasiz. Email o&apos;rniga oddiy nickname tanlang (3–30 belgi).
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-premium-gradient px-5 py-4 font-black text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saqlanmoqda..." : "Davom etish"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
        Boshqa hisob bilan kirishni xohlaysizmi?{" "}
        <button
          type="button"
          className="font-black text-primary"
          onClick={async () => {
            await logout();
            navigate("/login", { replace: true });
          }}
        >
          Chiqish
        </button>
        {" · "}
        <Link to="/" className="font-black text-primary">
          Bosh sahifa
        </Link>
      </p>
    </AuthLayout>
  );
}
