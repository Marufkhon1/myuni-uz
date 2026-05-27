import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { completeGoogleAuth } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    async function finishGoogleAuth() {
      const params = new URLSearchParams(window.location.hash.replace("#", ""));
      const access = params.get("access");
      const refresh = params.get("refresh");
      const storedNext = sessionStorage.getItem("myuni_auth_next");
      const next = params.get("next") || storedNext || "/dashboard";
      sessionStorage.removeItem("myuni_auth_next");

      if (!access || !refresh) {
        setError("Google orqali kirish tokenlari topilmadi.");
        return;
      }

      try {
        await completeGoogleAuth({ access, refresh });
        navigate(next, { replace: true });
      } catch {
        setError("Google orqali kirishda xatolik yuz berdi.");
      }
    }

    finishGoogleAuth();
  }, [completeGoogleAuth, navigate]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 text-slate-950 dark:bg-slateNight dark:text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">
          MyUni.uz
        </p>
        <h1 className="mt-4 text-3xl font-black">
          {error ? "Kirish yakunlanmadi" : "Google orqali kirish tekshirilmoqda..."}
        </h1>
        {error && (
          <>
            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">{error}</p>
            <Link
              to="/login"
              className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-black text-white"
            >
              Login sahifasiga qaytish
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
