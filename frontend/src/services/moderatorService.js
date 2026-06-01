import { api } from "./api.js";

export async function getModeratorReports(params = {}) {
  const { data } = await api.get("/auth/moderator/reports/", { params });
  return data;
}

export async function updateMessageReport(reportId, payload) {
  const { data } = await api.patch(`/auth/moderator/reports/message/${reportId}/`, payload);
  return data;
}

export async function updateReviewReport(reportId, payload) {
  const { data } = await api.patch(`/auth/moderator/reports/review/${reportId}/`, payload);
  return data;
}
