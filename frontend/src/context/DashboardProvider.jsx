import { DashboardContext } from "./dashboardContext.js";

export function DashboardProvider({ value, children }) {
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
