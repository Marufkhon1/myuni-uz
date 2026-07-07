import { lazy } from "react";

export const DashboardHomeSection = lazy(() => import("./DashboardHomeSection.jsx"));
export const DashboardChatSection = lazy(() => import("./DashboardChatSection.jsx"));
export const DashboardReviewsSection = lazy(() => import("./DashboardReviewsSection.jsx"));
export const DashboardFavoritesSection = lazy(
  () => import("../../components/dashboard/DashboardFavoritesSection.jsx")
);
export const UniversityCompareSection = lazy(
  () => import("../../components/dashboard/UniversityCompareSection.jsx")
);
export const PopularReviewsSection = lazy(
  () => import("../../components/dashboard/PopularReviewsSection.jsx")
);
export const ProfileSection = lazy(() => import("../../components/dashboard/ProfileSection.jsx"));
