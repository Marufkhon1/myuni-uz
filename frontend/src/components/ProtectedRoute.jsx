import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthCheckSkeleton } from "../components/skeletons/DashboardSkeletons.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { buildGoogleCompleteProfilePath } from "../utils/authPaths.js";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, role, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthCheckSkeleton />;
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (user?.needs_profile_setup && location.pathname !== "/oauth/google/complete") {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={buildGoogleCompleteProfilePath(next)} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
