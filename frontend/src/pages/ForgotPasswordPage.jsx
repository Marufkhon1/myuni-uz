import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormField from "@/components/ui/FormField.jsx";
import AuthLayout from "@/layouts/AuthLayout.jsx";
import { PAGE_META } from "@/config/siteMeta.js";
import { usePageMeta } from "@/hooks/usePageMeta.js";
import { useToast } from "@/hooks/useToast.js";
import { requestPasswordReset } from "@/services/authService.js";
import { getApiErrorMessage } from "@/utils/apiErrors.js";

export default function ForgotPasswordPage() {
  usePageMeta(PAGE_META.forgotPassword);

  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setCooldownSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (cooldownSeconds > 0) {
      return;
    }
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email);
      navigate(`/forgot-password/sent?email=${encodeURIComponent(email.trim())}`, { replace: true });
      return;
    } catch (requestError) {
      const status = requestError.response?.status;
      const data = requestError.response?.data;
      if (status === 429 && data?.retry_after_seconds) {
        setCooldownSeconds(Number(data.retry_after_seconds));
      }
      toast.error(
        data?.detail || getApiErrorMessage(requestError, "So'rov yuborilmadi. Qayta urinib ko'ring.")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Parolni tiklash"
      title="Parolni tiklash"
      subtitle="Hisobingizga bog'langan email manzilini kiriting."
      showBackHome={false}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Parolni unutdingizmi?</h1>
        </div>

        <FormField
          id="forgot-email"
          name="email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          placeholder="email@example.com"
        />

        <button
          type="submit"
          disabled={isSubmitting || cooldownSeconds > 0}
          className="w-full rounded-2xl bg-slate-950 px-6 py-4 font-black text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
        >
          {isSubmitting
            ? "Yuborilmoqda..."
            : cooldownSeconds > 0
              ? `Qayta urinish (${cooldownSeconds}s)`
              : "Havola yuborish"}
        </button>
        <Link to="/login" className="block text-center text-sm font-black text-primary">
          Kirish sahifasiga qaytish
        </Link>
      </form>
    </AuthLayout>
  );
}
