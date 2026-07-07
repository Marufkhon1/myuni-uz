import { useContext } from "react";
import { DashboardChatContext } from "@/context/dashboardChatContext.js";

export function useDashboardChatSection() {
  const context = useContext(DashboardChatContext);
  if (!context) {
    throw new Error("useDashboardChatSection faqat DashboardChatProvider ichida ishlatiladi.");
  }
  return context;
}
