import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout.jsx";
import FormField from "@/components/ui/FormField.jsx";
import { PAGE_META } from "@/config/siteMeta.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import { useFormAutofillSync } from "@/hooks/useFormAutofillSync.js";
import { useToast } from "@/hooks/useToast.js";
import { getGoogleAuthUrl } from "@/services/authService.js";
import { useAuth } from "@/hooks/useAuth.js";
import { getApiErrorMessage } from "@/utils/apiErrors.js";
import { mergeLoginPayload, validateLoginPayload } from "@/utils/authForm.js";
import { buildGoogleCompleteProfilePath, userNeedsGoogleProfileSetup } from "@/utils/authPaths.js";
import { dashboardPathForRole } from "@/utils/navigation.js";

const LOGIN_AUTOFILL_FIELDS = ["username", "password"];

function resolveAfterAuthPath(user, nextParam) {
  if (userNeedsGoogleProfileSetup(user)) {
    return buildGoogleCompleteProfilePath(nextParam);
  }
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
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const submittingRef = useRef(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const syncAutofillFields = useCallback((snapshot) => {
    setForm((current) => ({ ...current, ...snapshot }));
  }, []);

  const formRef = useFormAutofillSync(LOGIN_AUTOFILL_FIELDS, syncAutofillFields);

  useEffect(() => {
    const googleError = searchParams.get("google_error");
    if (googleError) {
      toast.error(googleError);
    }
  }, [searchParams, toast]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !submittingRef.current) {
      navigate(resolveAfterAuthPath(user, nextPath), { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, nextPath, user]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submittingRef.current) {
      return;
    }

    const formElement = event.currentTarget;
    submittingRef.current = true;
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const payload = mergeLoginPayload(formElement, {
        usernameRef,
        passwordRef,
        state: form,
      });
      setForm((current) => ({
        ...current,
        username: payload.username,
        password: payload.password,
      }));

      const validationErrors = validateLoginPayload(payload);
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        toast.error(validationErrors.username || validationErrors.password);
        return;
      }

      const loggedInUser = await login(payload);
      navigate(resolveAfterAuthPath(loggedInUser, nextPath), { replace: true });
    } catch (requestError) {
      toast.error(
        getApiErrorMessage(
          requestError,
          "Kirishda xatolik yuz berdi. Ma'lumotlarni tekshirib qayta urinib ko'ring."
        )
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
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
          "Google orqali kirish hozircha yoqilmagan. Login va parol bilan kiring yoki backend/.env da OAuth sozlang."
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
          Login yoki email va parolingiz bilan kiring.
        </p>
      </div>

      {passwordResetSuccess && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Parolingiz yangilandi. Endi yangi parol bilan kiring.
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="mt-7 space-y-5"
        autoComplete="on"
        noValidate
      >
        <FormField
          id="login-username"
          name="username"
          label="Login yoki email"
          value={form.username}
          onChange={updateField}
          inputRef={usernameRef}
          error={fieldErrors.username}
          required
          autoComplete="username"
          placeholder="masalan: ali_valiyev yoki email"
          inputClassName="myuni-autofill-aware"
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-black text-primary">
            Parolni unutdingizmi?
          </Link>
        </div>

        <FormField
          id="login-password"
          name="password"
          label="Parol"
          type="password"
          value={form.password}
          onChange={updateField}
          inputRef={passwordRef}
          error={fieldErrors.password}
          required
          autoComplete="current-password"
          placeholder="••••••••"
          inputClassName="myuni-autofill-aware"
        />

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
