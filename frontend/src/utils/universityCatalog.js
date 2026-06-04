export const OWNERSHIP_LABELS = {
  state: "Davlat",
  private: "Xususiy",
  international: "Xalqaro",
};

export function formatOwnershipLabel(university) {
  if (!university) {
    return "";
  }
  return (
    university.ownership_label ||
    university.ownership_type_label ||
    OWNERSHIP_LABELS[university.ownership_type] ||
    university.institution_label ||
    university.institution_type ||
    ""
  );
}

export const DEFAULT_CATALOG_FILTERS = {
  q: "",
  city: "",
  ownership: "",
  min_rating: "",
  min_reviews: "",
  sort: "name",
};

export function parseCatalogSearchParams(searchParams) {
  return {
    q: searchParams.get("q") || "",
    city: searchParams.get("city") || "",
    ownership: searchParams.get("ownership") || "",
    min_rating: searchParams.get("min_rating") || "",
    min_reviews: searchParams.get("min_reviews") || "",
    sort: searchParams.get("sort") || "name",
  };
}

export function buildCatalogSearchParams(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === "" || value == null) {
      return;
    }
    if (key === "sort" && value === "name") {
      return;
    }
    params.set(key, String(value));
  });
  return params;
}

export function catalogFiltersKey(filters) {
  return buildCatalogSearchParams(filters).toString();
}

export function catalogFiltersEqual(left, right) {
  return catalogFiltersKey(left) === catalogFiltersKey(right);
}

export function activeFilterCount(filters) {
  return Object.entries(filters).filter(([key, value]) => {
    if (key === "sort" && value === "name") {
      return false;
    }
    return value !== "" && value != null;
  }).length;
}

export function formatAdmissionDate(value) {
  if (!value) {
    return "—";
  }
  try {
    return new Intl.DateTimeFormat("uz-UZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatUzsAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return `${new Intl.NumberFormat("uz-UZ").format(Math.round(amount))} so'm`;
}

/** @returns {{ label: string, value: string }[]} */
export function formatContractPricingLines(contractPricing) {
  if (!contractPricing?.forms?.length) {
    return [];
  }
  const year = contractPricing.academic_year ? ` (${contractPricing.academic_year})` : "";
  return contractPricing.forms
    .filter((form) => form.average_uzs)
    .map((form) => ({
      label: `Kontrakt — ${form.label}${year}`,
      value: formatUzsAmount(form.average_uzs) || "—",
    }));
}
