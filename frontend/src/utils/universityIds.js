export function sameUniversityId(a, b) {
  if (a == null || b == null) {
    return false;
  }
  return String(a) === String(b);
}

export function findUniversityById(universities, universityId) {
  if (universityId == null || !universities?.length) {
    return null;
  }
  return universities.find((university) => sameUniversityId(university.id, universityId)) ?? null;
}

export function joinedUniversityIdsHas(joinedIds, universityId) {
  if (!joinedIds || universityId == null) {
    return false;
  }

  if (joinedIds instanceof Set) {
    for (const id of joinedIds) {
      if (sameUniversityId(id, universityId)) {
        return true;
      }
    }
    return false;
  }

  if (Array.isArray(joinedIds)) {
    return joinedIds.some((id) => sameUniversityId(id, universityId));
  }

  return false;
}
