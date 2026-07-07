import { useContext } from "react";
import { DashboardContext } from "@/context/dashboardContext.js";

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard faqat DashboardProvider ichida ishlatiladi.");
  }
  return context;
}
