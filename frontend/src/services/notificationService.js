import { api } from "./api.js";

export async function getNotifications() {
  const { data } = await api.get("/auth/notifications/");
  return data;
}

export async function markNotificationsRead(notificationId) {
  const payload = notificationId ? { id: notificationId } : {};
  const { data } = await api.post("/auth/notifications/mark-read/", payload);
  return data;
}
