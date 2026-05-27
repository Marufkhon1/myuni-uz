import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { dashboardPathForRole } from "../utils/navigation.js";

export default function DashboardRedirect() {
  const { role } = useAuth();
  const { search } = useLocation();

  return <Navigate to={`${dashboardPathForRole(role)}${search}`} replace />;
}
