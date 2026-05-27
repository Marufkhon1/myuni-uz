import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-white text-slate-950 dark:bg-slateNight dark:text-white">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
            MyUni.uz
          </p>
          <p className="mt-2 text-lg font-black">Hisob tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
