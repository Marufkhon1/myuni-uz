import { api } from "./api.js";

export async function getMyReports() {
  const { data } = await api.get("/auth/my-reports/");
  return data;
}

export async function confirmEmailVerification({ uid, token }) {
  const { data } = await api.post("/auth/verify-email/confirm/", { uid, token });
  return data;
}

export async function resendEmailVerification(email) {
  const { data } = await api.post("/auth/verify-email/resend/", { email });
  return data;
}

export async function getEmailVerificationStatus() {
  const { data } = await api.get("/auth/verify-email/status/");
  return data;
}
