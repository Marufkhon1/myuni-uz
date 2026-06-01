import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import RateLimitNotice from "../components/RateLimitNotice.jsx";
import { PAGE_META } from "../config/siteMeta.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { useToast } from "../hooks/useToast.js";
import { resendEmailVerification } from "../services/trustService.js";
import { getApiErrorMessage, getRateLimitInfo } from "../utils/apiErrors.js";

export default function VerifyEmailPendingPage() {
  usePageMeta(PAGE_META.verifyEmailPending);

  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimit, setRateLimit] = useState(null);
  const [rateLimitActive, setRateLimitActive] = useState(false);

  async function handleResend() {
    if (!email || isSubmitting || rateLimitActive) {
      return;
    }
    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Email tasdiqlash"
      title="Pochtangizni tekshiring."
      subtitle="Hisobingizni faollashtirish uchun emaildagi havolani bosing."
      showBackHome={false}
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 dark:border-blue-400/30 dark:bg-blue-950/40">
          <p className="text-sm font-semibold leading-relaxed text-blue-900 dark:text-blue-100">
            {email ? (
              <>
                Tasdiqlash havolasi <span className="font-black">{email}</span> manziliga yuborildi.
              </>
            ) : (
              <>Ro&apos;yxatdan o&apos;tgan email manzilingizga tasdiqlash havolasi yuborildi.</>
            )}
          </p>
        </div>

        {!email ? (
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            Email manzili topilmadi. Ro&apos;yxatdan o&apos;tish yoki kirish sahifasidan qayta urinib ko&apos;ring.
          </p>
        ) : null}

        <ul className="space-y-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <li>1. Email qutingizni oching — spam papkasini ham tekshiring.</li>
          <li>2. «Email manzilingizni tasdiqlang» xatidagi havolani bosing.</li>
          <li>3. Tasdiqlagach avtomatik tizimga kirasiz.</li>
        </ul>

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
          onClick={handleResend}
          disabled={!email || isSubmitting || rateLimitActive}
          className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-4 font-black text-slate-800 transition hover:border-primary disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-white"
        >
          {isSubmitting ? "Yuborilmoqda..." : "Tasdiqlash xatini qayta yuborish"}
        </button>

        <Link
          to="/login"
          className="block w-full rounded-2xl bg-slate-950 px-6 py-4 text-center font-black text-white dark:bg-white dark:text-slate-950"
        >
          Kirish sahifasiga qaytish
        </Link>
      </div>
    </AuthLayout>
  );
}
