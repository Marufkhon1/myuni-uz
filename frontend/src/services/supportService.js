import { api } from "./api.js";

export async function sendSupportMessage(message) {
  const response = await api.post("/auth/support/message/", { message });
  return response.data;
}
