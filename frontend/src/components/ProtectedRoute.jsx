import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthCheckSkeleton } from "../components/skeletons/DashboardSkeletons.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthCheckSkeleton />;
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
