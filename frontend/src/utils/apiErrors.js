export function getApiErrorMessage(error, fallback) {
  if (!error?.response) {
    if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
      return "Backendga ulanib bo'lmadi. Backend server ishlayotganini tekshiring (terminalda: python manage.py runserver).";
    }
    return error?.message || fallback;
  }

  const data = error.response.data;
  if (data?.code === "google_oauth_not_configured" && typeof data?.detail === "string") {
    return data.detail;
  }
  if (error.response.status === 503 && typeof data?.detail === "string") {
    return data.detail;
  }
  if (typeof data?.detail === "string") {
    return data.detail;
  }
  if (Array.isArray(data?.non_field_errors) && data.non_field_errors[0]) {
    return data.non_field_errors[0];
  }
  if (data && typeof data === "object") {
    const firstFieldError = Object.values(data).flat()[0];
    if (firstFieldError) {
      return Array.isArray(firstFieldError) ? firstFieldError[0] : firstFieldError;
    }
  }
  return fallback;
}
