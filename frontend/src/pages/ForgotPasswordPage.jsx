import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { requestPasswordReset } from "../services/authService.js";
import { getApiErrorMessage } from "../utils/apiErrors.js";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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
    setError("");
    setMessage("");
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
      setError(
        data?.detail || getApiErrorMessage(requestError, "So'rov yuborilmadi. Qayta urinib ko'ring.")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Parolni tiklash"
      title="Email manzilingizni kiriting."
      subtitle="Agar hisob mavjud bo'lsa, parolni yangilash havolasi yuboriladi."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Parolni unutdingizmi?</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Ro'yxatdan o'tgan emailni kiriting.
          </p>
        </div>
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email@example.com"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-primary dark:border-white/15 dark:bg-slate-800 dark:text-white"
        />
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        {message && <p className="text-sm font-semibold text-primary">{message}</p>}
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
