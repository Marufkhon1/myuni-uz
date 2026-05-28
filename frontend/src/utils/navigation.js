export function dashboardPathForRole(role) {
  return role === "student" ? "/student/dashboard" : "/applicant/dashboard";
}

export function buildUniversityPublicPath(university) {
  if (university?.slug) {
    return `/universitet/${university.slug}`;
  }
  return "/#universities";
}

function reviewsUniversitySearchParams(university) {
  const params = new URLSearchParams({ section: "reviews" });
  if (university?.id != null) {
    params.set("university_id", String(university.id));
  } else if (university?.short_name) {
    params.set("university", university.short_name);
  } else if (university?.name) {
    params.set("university", university.name);
  }
  return params;
}

/** Kirishdan keyin — rolga qarab to'g'ri kabinet. */
export function buildDashboardReviewsUniversityPath({ role, university }) {
  const params = reviewsUniversitySearchParams(university);
  const base = role ? dashboardPathForRole(role) : "/dashboard";
  return `${base}?${params.toString()}`;
}

/** Mehmon uchun login/signup `next` — `/dashboard` rolga yo'naltiradi. */
export function buildDashboardReviewsUniversityNext(university) {
  const params = reviewsUniversitySearchParams(university);
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
