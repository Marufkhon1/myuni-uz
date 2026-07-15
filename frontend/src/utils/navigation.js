export function dashboardPathForRole(role) {
  return role === "student" ? "/student/dashboard" : "/applicant/dashboard";
}

export function buildDashboardSectionPath(role, section = "home", options = {}) {
  const base = `${dashboardPathForRole(role)}/${section}`;
  const params = new URLSearchParams();
  if (options.universityId != null) {
    params.set("university_id", String(options.universityId));
  }
  if (options.threadId != null) {
    params.set("thread_id", String(options.threadId));
    params.set("chat_panel", "private");
  }
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function parseDashboardSectionFromPath(pathname) {
  const match = pathname.match(/\/(applicant|student)\/dashboard\/([a-z]+)/);
  if (!match) {
    return null;
  }
  return match[2];
}

export function buildUniversityPublicPath(university) {
  if (university?.slug) {
    return `/universitet/${university.slug}`;
  }
  return "/#universities";
}

/** Kirishdan keyin — rolga qarab to'g'ri kabinet. */
export function buildDashboardReviewsUniversityPath({ role, university }) {
  return buildDashboardSectionPath(role || "applicant", "reviews", {
    universityId: university?.id,
  });
}

/** Mehmon uchun login/signup `next` — `/dashboard` rolga yo'naltiradi. */
export function buildDashboardReviewsUniversityNext(university) {
  const params = new URLSearchParams({ section: "reviews" });
  if (university?.id != null) {
    params.set("university_id", String(university.id));
  } else if (university?.short_name) {
    params.set("university", university.short_name);
  } else if (university?.name) {
    params.set("university", university.name);
  }
  return `/dashboard?${params.toString()}`;
}

export function buildUniversityDetailsPath({ role, universityName, university, isAuthenticated }) {
  const params = new URLSearchParams({ section: "reviews" });
  if (university?.id != null) {
    params.set("university_id", String(university.id));
  } else if (universityName) {
    params.set("university", universityName);
  } else if (university?.name) {
    params.set("university", university.name);
  }
  const dashboardTarget = role
    ? `${dashboardPathForRole(role)}?${params.toString()}`
    : `/dashboard?${params.toString()}`;

  if (isAuthenticated) {
    return dashboardTarget;
  }

  return `/login?next=${encodeURIComponent(dashboardTarget)}`;
}

export function buildReviewsHubPath({ role, isAuthenticated }) {
  const params = new URLSearchParams({ section: "reviews" });
  const dashboardTarget = role
    ? `${dashboardPathForRole(role)}?${params.toString()}`
    : `/dashboard?${params.toString()}`;

  if (isAuthenticated) {
    return dashboardTarget;
  }

  return `/login?next=${encodeURIComponent(dashboardTarget)}`;
}
