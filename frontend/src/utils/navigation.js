export function dashboardPathForRole(role) {
  return role === "student" ? "/student/dashboard" : "/applicant/dashboard";
}

export function buildUniversityDetailsPath({ role, universityName, isAuthenticated }) {
  const params = new URLSearchParams({
    section: "reviews",
    university: universityName,
  });
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
