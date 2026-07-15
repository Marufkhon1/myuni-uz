/**
 * Universitet content silos — Phase 3 URL IA (additive).
 * Hub thin; each silo is a unique indexable body.
 */

export const UNIVERSITY_SILOS = {
  overview: {
    id: "overview",
    path: "",
    label: "Umumiy",
    hashAliases: ["#overview", "#about", "#contact"],
  },
  reviews: {
    id: "reviews",
    path: "sharhlari",
    label: "Sharhlar",
    hashAliases: ["#reviews"],
  },
  faculties: {
    id: "faculties",
    path: "fakultetlar",
    label: "Fakultetlar",
    hashAliases: ["#programs", "#fakultetlar", "#faculties"],
  },
  admission: {
    id: "admission",
    path: "qabul",
    label: "Qabul",
    hashAliases: ["#admission", "#qabul"],
  },
};

export const UNIVERSITY_SILO_LIST = [
  UNIVERSITY_SILOS.overview,
  UNIVERSITY_SILOS.reviews,
  UNIVERSITY_SILOS.faculties,
  UNIVERSITY_SILOS.admission,
];

export function buildUniversitySiloPath(slug, silo = "overview") {
  if (!slug) {
    return "/universitetlar";
  }
  const base = `/universitet/${slug}`;
  const entry =
    typeof silo === "string"
      ? UNIVERSITY_SILO_LIST.find((item) => item.id === silo || item.path === silo)
      : silo;
  if (!entry || !entry.path) {
    return base;
  }
  return `${base}/${entry.path}`;
}

/** Legacy hash → silo path segment ("" for overview). */
export function resolveSiloFromHash(hash = "") {
  const normalized = String(hash || "").trim().toLowerCase();
  if (!normalized || normalized === "#") {
    return UNIVERSITY_SILOS.overview;
  }
  const keyed = normalized.startsWith("#") ? normalized : `#${normalized}`;
  return (
    UNIVERSITY_SILO_LIST.find((silo) => silo.hashAliases.includes(keyed)) ||
    UNIVERSITY_SILOS.overview
  );
}

export function siloFromPathname(pathname = "") {
  const match = String(pathname).match(/\/universitet\/[^/]+(?:\/([^/]+))?\/?$/);
  const segment = match?.[1] || "";
  return (
    UNIVERSITY_SILO_LIST.find((silo) => silo.path === segment) || UNIVERSITY_SILOS.overview
  );
}
