import { DashboardChatContext } from "./dashboardChatContext.js";

export function DashboardChatProvider({ value, children }) {
  return <DashboardChatContext.Provider value={value}>{children}</DashboardChatContext.Provider>;
}
