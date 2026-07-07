import { useEffect } from "react";

export function useDashboardChatSummaryPolling({ isDataLoading, refreshChatSummaries, intervalMs = 30000 }) {
  useEffect(() => {
    if (isDataLoading) {
      return undefined;
    }

    const intervalId = window.setInterval(refreshChatSummaries, intervalMs);
    return () => window.clearInterval(intervalId);
  }, [isDataLoading, refreshChatSummaries, intervalMs]);
}
