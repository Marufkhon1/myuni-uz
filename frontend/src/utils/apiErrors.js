export function getRateLimitInfo(error) {
  const data = error?.response?.data;
  if (error?.response?.status === 429 && data) {
    return {
      detail:
        typeof data.detail === "string"
          ? data.detail
          : "So'rovlar limiti oshdi. Biroz kutib qayta urinib ko'ring.",
      retryAfterSeconds: Math.max(0, Number(data.retry_after_seconds) || 0),
      code: data.code || "rate_limited",
    };
  }
  return null;
}

export function formatRateLimitMessage(info) {
  if (!info) {
    return "";
  }
  if (info.retryAfterSeconds > 0) {
    return `${info.detail} Qayta urinish: ${info.retryAfterSeconds} soniyadan keyin.`;
  }
  return info.detail;
}

export function getEmailNotVerifiedInfo(error) {
  const data = error?.response?.data;
  if (data?.code === "email_not_verified") {
    return {
      detail:
        typeof data.detail === "string"
          ? data.detail
          : "Email manzilingiz tasdiqlanmagan.",
      email: data.email || "",
    };
  }
  return null;
}

export function getApiErrorMessage(error, fallback) {
  const rateLimit = getRateLimitInfo(error);
  if (rateLimit) {
    return formatRateLimitMessage(rateLimit);
  }

  const emailNotVerified = getEmailNotVerifiedInfo(error);
  if (emailNotVerified) {
    return emailNotVerified.detail;
  }

  if (!error?.response) {
    if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
      return "Backendga ulanib bo'lmadi. Backend server ishlayotganini tekshiring (backend papkada: .\\manage.ps1 runserver).";
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
  if (error.response.status === 404) {
    const requestUrl = String(error.config?.url || "");
    if (requestUrl.includes("compare/share")) {
      return "Taqqoslash havolasi API topilmadi. Backend serverni qayta ishga tushiring (backend papkada: .\\manage.ps1 runserver 127.0.0.1:8000).";
    }
    return "So'ralgan manba topilmadi (404).";
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
