import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";

export default function ForgotPasswordSentPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <AuthLayout
      eyebrow="Email yuborildi"
      title="Pochtangizni tekshiring."
      subtitle="Emaildagi havolani oching va yangi parol kiriting."
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 dark:border-emerald-400/30 dark:bg-emerald-950/40">
          <p className="text-sm font-semibold leading-relaxed text-emerald-900 dark:text-emerald-100">
            {email ? (
              <>
                Parol tiklash havolasi <span className="font-black">{email}</span> manziliga yuborildi
                (agar bu email bilan ro&apos;yxatdan o&apos;tgan bo&apos;lsangiz).
              </>
            ) : (
              <>Agar email ro&apos;yxatdan o&apos;tgan bo&apos;lsa, havola shu manzilga yuborildi.</>
            )}
          </p>
        </div>

        <ul className="space-y-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <li>1. O&apos;z emailingizni oching — spamni ham tekshiring.</li>
          <li>2. &quot;Parolni tiklash&quot; tugmasini bosing.</li>
          <li>3. Yangi parol va tasdiqlashni kiriting.</li>
        </ul>

        <Link
          to="/login"
          className="block w-full rounded-2xl bg-slate-950 px-6 py-4 text-center font-black text-white dark:bg-white dark:text-slate-950"
        >
          Kirish sahifasiga qaytish
        </Link>
        <Link to="/forgot-password" className="block text-center text-sm font-black text-primary">
          Boshqa email bilan qayta so&apos;rash
        </Link>
      </div>
    </AuthLayout>
  );
}
