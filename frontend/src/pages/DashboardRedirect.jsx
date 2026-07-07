import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.js";
import { dashboardPathForRole } from "@/utils/navigation.js";

const VALID_SECTIONS = new Set([
  "home",
  "reviews",
  "chats",
  "compare",
  "popular",
  "profile",
  "favorites",
]);

export default function DashboardRedirect() {
  const { role } = useAuth();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const section = params.get("section") || "home";
  params.delete("section");
  const safeSection = VALID_SECTIONS.has(section) ? section : "home";
  const query = params.toString();
  const target = `${dashboardPathForRole(role)}/${safeSection}${query ? `?${query}` : ""}`;

  return <Navigate to={target} replace />;
}
