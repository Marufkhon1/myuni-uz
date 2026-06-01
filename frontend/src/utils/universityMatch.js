export function matchUniversityByText(universities, text) {
  if (!text?.trim() || !universities?.length) {
    return null;
  }

  const query = text.trim().toLowerCase();

  const exact = universities.find(
    (university) =>
      university.name.toLowerCase() === query ||
      (university.short_name || "").toLowerCase() === query
  );
  if (exact) {
    return exact;
  }

  return (
    universities.find((university) => {
      const name = university.name.toLowerCase();
      const shortName = (university.short_name || "").toLowerCase();
      return name.includes(query) || shortName.includes(query) || query.includes(shortName);
    }) ?? null
  );
}

export function hasMatchedUniversity(universities, universityText) {
  if (!universityText?.trim()) {
    return false;
  }
  if (!universities?.length) {
    return Boolean(universityText.trim());
  }
  return Boolean(matchUniversityByText(universities, universityText));
}
