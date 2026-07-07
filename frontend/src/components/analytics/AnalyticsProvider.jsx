import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initAnalytics, normalizeAnalyticsPath, trackPageView } from "@/lib/analytics.js";

export default function AnalyticsProvider({ children }) {
  const location = useLocation();

  useEffect(() => {
    initAnalytics().catch(() => {});
  }, []);

  useEffect(() => {
    const path = normalizeAnalyticsPath(
      location.pathname,
      location.search,
      location.hash
    );
    trackPageView(path, { title: document.title });
  }, [location.pathname, location.search, location.hash]);

  return children;
}
